'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { PaymentStatus } from '@box33/types'
import { Link } from '@/i18n/navigation'
import { useCart } from './cart/CartProvider'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 2 * 60 * 1000

type ViewState = 'checking' | 'approved' | 'declined' | 'expired'

export function ResultClient() {
  const t = useTranslations('checkout.result')
  const searchParams = useSearchParams()
  const { clear } = useCart()
  const [state, setState] = useState<ViewState>('checking')
  const [reference, setReference] = useState<string | null>(null)
  const clearedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const startedAt = Date.now()

    const poll = async (ref: string) => {
      if (cancelled) return
      try {
        const response = await fetch(`/api/payments/status?ref=${encodeURIComponent(ref)}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = (await response.json()) as { status: PaymentStatus }
          if (data.status === 'CONFIRMED') {
            if (!clearedRef.current) {
              clearedRef.current = true
              clear()
              window.sessionStorage.removeItem('box33_last_ref')
            }
            setState('approved')
            return
          }
          if (data.status === 'FAILED' || data.status === 'CANCELLED') {
            setState('declined')
            return
          }
          if (data.status === 'EXPIRED') {
            setState('expired')
            return
          }
        }
      } catch {
        /* transient network error — keep polling */
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setState('expired')
        return
      }
      setTimeout(() => void poll(ref), POLL_INTERVAL_MS)
    }

    // Deferred kickoff: sessionStorage is client-only and the first render
    // must match SSR (checking state).
    const kickoff = setTimeout(() => {
      const ref = searchParams.get('ref') ?? window.sessionStorage.getItem('box33_last_ref')
      setReference(ref)
      if (!ref) {
        setState('declined')
        return
      }
      void poll(ref)
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(kickoff)
    }
  }, [searchParams, clear])

  const panels: Record<
    Exclude<ViewState, 'checking'>,
    { title: string; description: string; tone: string }
  > = {
    approved: {
      title: t('approvedTitle'),
      description: t('approvedDescription'),
      tone: 'border-moss/50 text-moss',
    },
    declined: {
      title: t('declinedTitle'),
      description: t('declinedDescription'),
      tone: 'border-ember/50 text-ember',
    },
    expired: {
      title: t('expiredTitle'),
      description: t('expiredDescription'),
      tone: 'border-gold/50 text-gold',
    },
  }

  if (state === 'checking') {
    return (
      <div className="text-center">
        <div className="border-bone/20 border-t-moss mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2" />
        <p className="font-condensed text-bone/70 text-xl font-semibold tracking-[3px] uppercase">
          {state === 'checking' ? t('checking') : null}
        </p>
        {reference && <p className="text-bone/40 mt-3 text-sm">{t('reference', { reference })}</p>}
      </div>
    )
  }

  const panel = panels[state]
  return (
    <div className={`bg-surface max-w-lg border p-10 text-center ${panel.tone}`}>
      <h1 className="font-display mb-3 text-[clamp(30px,4vw,44px)] tracking-wide uppercase">
        {panel.title}
      </h1>
      <p className="text-bone/75 mb-6 leading-relaxed">{panel.description}</p>
      {reference && <p className="text-bone/40 mb-6 text-sm">{t('reference', { reference })}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/tienda"
          className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss inline-flex border px-6 py-3 font-semibold tracking-[2px] uppercase"
        >
          {t('backToStore')}
        </Link>
        {state !== 'approved' && (
          <Link
            href="/checkout"
            className="bg-bone font-condensed inline-flex px-6 py-3 font-bold tracking-[2px] text-[#20211b] uppercase hover:bg-white"
          >
            {t('retry')}
          </Link>
        )}
      </div>
    </div>
  )
}
