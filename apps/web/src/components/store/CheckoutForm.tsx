'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { CheckoutSession } from '@box33/types'
import { Link } from '@/i18n/navigation'
import { buildWaLink } from '@/lib/wa'
import { formatCOP } from '@/lib/format'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { useCart } from './cart/CartProvider'

const LABEL =
  'block font-condensed text-xs font-semibold uppercase tracking-[2px] text-bone/60 mb-[5px]'
const INPUT =
  'w-full box-border bg-carbon-deep border border-bone/[.22] px-3.5 py-3 text-base text-bone mb-3.5'

export function CheckoutForm({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const { items, totalCents } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [wompiUnavailable, setWompiUnavailable] = useState(false)

  const waFallbackHref = buildWaLink(
    whatsappNumber,
    t('waFallbackMessage', {
      items: items
        .map((i) => `${i.name} x${i.quantity}${i.size ? ` (talla ${i.size})` : ''}`)
        .join(', '),
    })
  )

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-bone/80 mb-6 text-3xl uppercase">{t('errors.empty')}</p>
        <Link
          href="/tienda"
          className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss inline-flex border px-6 py-3.5 text-lg font-semibold tracking-[2.5px] uppercase"
        >
          {tCart('emptyCta')}
        </Link>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
        }),
      })
      if (response.status === 503) {
        setWompiUnavailable(true)
        return
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string | string[] }
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message
        toast.error(msg ?? t('errors.failed'))
        return
      }
      const session = (await response.json()) as CheckoutSession
      window.sessionStorage.setItem('box33_last_ref', session.reference)
      window.location.assign(session.checkoutUrl)
    } catch {
      toast.error(t('errors.failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-display mb-8 text-[clamp(34px,4.5vw,56px)] tracking-wide uppercase">
        {t('title')}
      </h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-[clamp(24px,4vw,48px)]">
        {/* Summary */}
        <div className="border-bone/10 bg-surface border p-6">
          <h2 className="font-condensed mb-4 text-lg font-bold tracking-[3px] uppercase">
            {t('summary')}
          </h2>
          <ul>
            {items.map((item) => (
              <li
                key={`${item.productId}|${item.size ?? ''}`}
                className="border-bone/10 flex items-center gap-3 border-b border-dashed py-3"
              >
                <div className="relative h-14 w-[46px] flex-none overflow-hidden bg-[#dddbd0]">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="46px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-condensed truncate text-[15px] font-bold tracking-wide uppercase">
                    {item.name} ×{item.quantity}
                  </p>
                  <p className="text-bone/50 text-xs">
                    {item.size ? tCart('size', { size: item.size }) : tCart('noSize')}
                  </p>
                </div>
                <span className="font-led text-sm font-semibold">
                  {formatCOP(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-condensed text-bone/60 text-sm font-semibold tracking-[3px] uppercase">
              {tCart('total')}
            </span>
            <span className="font-led text-2xl font-bold">{formatCOP(totalCents)}</span>
          </div>
        </div>

        {/* Customer */}
        <form onSubmit={submit} className="border-bone/10 bg-surface border p-6">
          <label htmlFor="co-name" className={LABEL}>
            {t('nameLabel')}
          </label>
          <input
            id="co-name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            autoComplete="name"
            className={INPUT}
          />
          <label htmlFor="co-email" className={LABEL}>
            {t('emailLabel')}
          </label>
          <input
            id="co-email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            className={INPUT}
          />
          <label htmlFor="co-phone" className={LABEL}>
            {t('phoneLabel')}
          </label>
          <input
            id="co-phone"
            required
            minLength={7}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
            inputMode="tel"
            autoComplete="tel"
            className={INPUT}
          />

          <p className="text-bone/50 mb-5 text-[13px] leading-relaxed">{t('pickupNote')}</p>

          {wompiUnavailable ? (
            <div className="border-gold/40 bg-gold/10 border p-4">
              <p className="text-bone/80 mb-3 text-sm leading-relaxed">{t('unavailable')}</p>
              <a
                href={waFallbackHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-wa font-condensed inline-flex items-center gap-2.5 px-6 py-3 text-base font-bold tracking-[2px] text-[#111210] uppercase hover:bg-[#3ce07a] hover:text-[#111210]"
              >
                <WhatsAppIcon size={17} />
                {t('unavailableCta')}
              </a>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="bg-bone font-condensed w-full cursor-pointer px-6 py-4 text-[19px] font-bold tracking-[2.5px] text-[#20211b] uppercase shadow-[5px_5px_0_rgba(0,0,0,.4)] transition-colors hover:bg-white disabled:opacity-60"
            >
              {submitting ? t('processing') : t('payCta')}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
