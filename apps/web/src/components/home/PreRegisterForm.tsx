'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { LEAD_GOALS, type LeadGoal } from '@box33/types'
import { Link } from '@/i18n/navigation'

const LABEL =
  'block font-condensed text-xs font-semibold uppercase tracking-[2px] text-bone/60 mb-[5px]'
const INPUT =
  'w-full box-border bg-[#15160f] border border-bone/[.22] px-3.5 py-3 text-base text-bone mb-3.5 focus:border-moss'

export function PreRegisterForm() {
  const t = useTranslations('hero.form')
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [goal, setGoal] = useState<LeadGoal>('strength')
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (name.trim().length >= 2 && phone.trim().length >= 7) {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), phone: phone.trim(), goal }),
        })
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string }
          toast.error(data.message ?? tCommon('error'))
          return
        }
      }
      // Either way the design's promise holds: show the plans.
      document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <div className="animate-hero-up" style={{ animationDelay: '.22s' }}>
      <form
        onSubmit={submit}
        className="border-bone/[.16] max-w-[440px] border bg-[rgba(13,14,10,.72)] p-[clamp(24px,3vw,32px)] shadow-[0_20px_50px_rgba(0,0,0,.5)] backdrop-blur-lg"
      >
        <div className="mb-1.5 flex items-center gap-[11px]">
          <span className="animate-live-pulse bg-ember h-[9px] w-[9px] rounded-full" />
          <span className="font-condensed text-moss text-[13px] font-bold tracking-[3px] uppercase">
            {t('liveBadge')}
          </span>
        </div>
        <h2 className="font-display mb-1.5 text-[clamp(26px,3vw,36px)] leading-none tracking-wide text-white uppercase">
          {t('title')}
        </h2>
        <p className="text-bone/70 mb-5 text-[15px] leading-normal">{t('subtitle')}</p>

        <label htmlFor="pre-nombre" className={LABEL}>
          {t('nameLabel')}
        </label>
        <input
          id="pre-nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          autoComplete="name"
          className={INPUT}
        />

        <label htmlFor="pre-tel" className={LABEL}>
          {t('phoneLabel')}
        </label>
        <input
          id="pre-tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          inputMode="tel"
          autoComplete="tel"
          className={INPUT}
        />

        <label htmlFor="pre-obj" className={LABEL}>
          {t('goalLabel')}
        </label>
        <select
          id="pre-obj"
          value={goal}
          onChange={(e) => setGoal(e.target.value as LeadGoal)}
          className={`${INPUT} mb-[22px] appearance-none`}
        >
          {LEAD_GOALS.map((g) => (
            <option key={g} value={g}>
              {tGoals(g)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={pending}
          className="bg-bone font-condensed inline-flex w-full cursor-pointer items-center justify-center gap-2.5 px-6 py-[15px] text-[19px] font-bold tracking-[2.5px] text-[#20211b] uppercase shadow-[5px_5px_0_rgba(0,0,0,.4)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
        >
          {t('submit')}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </button>
        <p className="text-bone/50 mt-3.5 text-center text-[13px]">
          {t('footBefore')} <span className="text-moss font-bold">{t('footFree')}</span>{' '}
          {t('footOr')}{' '}
          <Link href="/tienda" className="text-bone/70 underline hover:text-white">
            {t('footStore')}
          </Link>
        </p>
      </form>
    </div>
  )
}
