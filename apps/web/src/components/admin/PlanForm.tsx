'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Plan } from '@box33/types'
import { cn } from '@/lib/cn'
import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { savePlan } from './actions'

const UNITS = ['class', 'month', 'quarter'] as const

export function PlanForm({ plan }: { plan: Plan }) {
  const t = useTranslations('admin.plans')
  const tPlans = useTranslations('plans')
  const tCommon = useTranslations('common')
  const [name, setName] = useState(plan.name)
  const [tagline, setTagline] = useState(plan.tagline)
  const [pesos, setPesos] = useState(String(Math.round(plan.priceCents / 100)))
  const [unit, setUnit] = useState<Plan['unit']>(plan.unit)
  const [features, setFeatures] = useState(plan.features.join('\n'))
  const [popular, setPopular] = useState(plan.popular)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const priceCents = Math.round(Number(pesos) * 100)
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      toast.error(tCommon('error'))
      return
    }
    startTransition(async () => {
      const result = await savePlan(plan.key, {
        name,
        tagline,
        priceCents,
        unit,
        features: features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        popular,
      })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'bg-surface border border-l-4 p-[18px]',
        plan.popular ? 'border-gold/50 border-l-gold' : 'border-bone/10 border-l-olive'
      )}
    >
      <label className={ADMIN_LABEL}>{t('nameLabel')}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={`${ADMIN_INPUT} mb-3`}
      />
      <label className={ADMIN_LABEL}>{t('taglineLabel')}</label>
      <input
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        className={`${ADMIN_INPUT} mb-3`}
      />
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className={ADMIN_LABEL}>{t('priceLabel')}</label>
          <input
            value={pesos}
            onChange={(e) => setPesos(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            required
            className={`${ADMIN_INPUT} font-led`}
          />
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('unitLabel')}</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Plan['unit'])}
            className={ADMIN_INPUT}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {tPlans(`unit.${u}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className={ADMIN_LABEL}>{t('featuresLabel')}</label>
      <textarea
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
        rows={4}
        className={`${ADMIN_INPUT} mb-3 resize-y leading-relaxed`}
      />
      <label className="font-condensed text-bone/70 mb-4 flex cursor-pointer items-center gap-2 text-sm tracking-wider uppercase">
        <input
          type="checkbox"
          checked={popular}
          onChange={(e) => setPopular(e.target.checked)}
          className="h-4 w-4 accent-[#C9A648]"
        />
        {t('popularLabel')}
      </label>
      <button type="submit" disabled={pending} className={ADMIN_SAVE}>
        {pending ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  )
}
