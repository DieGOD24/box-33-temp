'use client'

import { useId, useTransition } from 'react'
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
  const fieldId = useId()
  const [pending, startTransition] = useTransition()

  // Uncontrolled form: fields are seeded from `plan` via defaultValue and read
  // from the DOM on submit, so nothing derives React state from props. The
  // `key={plan.key}` on the outer element remounts the form when a different
  // plan is passed, refreshing the defaults.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const priceCents = Math.round(Number(data.get('price')) * 100)
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      toast.error(tCommon('error'))
      return
    }
    startTransition(async () => {
      const result = await savePlan(plan.key, {
        name: String(data.get('name') ?? ''),
        tagline: String(data.get('tagline') ?? ''),
        priceCents,
        unit: String(data.get('unit')) as Plan['unit'],
        features: String(data.get('features') ?? '')
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        popular: data.get('popular') === 'on',
      })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <form
      key={plan.key}
      onSubmit={submit}
      className={cn(
        'bg-surface border border-l-4 p-[18px]',
        plan.popular ? 'border-gold/50 border-l-gold' : 'border-bone/10 border-l-olive'
      )}
    >
      <label htmlFor={`${fieldId}-name`} className={ADMIN_LABEL}>
        {t('nameLabel')}
      </label>
      <input
        id={`${fieldId}-name`}
        name="name"
        defaultValue={plan.name}
        required
        className={`${ADMIN_INPUT} mb-3`}
      />
      <label htmlFor={`${fieldId}-tagline`} className={ADMIN_LABEL}>
        {t('taglineLabel')}
      </label>
      <input
        id={`${fieldId}-tagline`}
        name="tagline"
        defaultValue={plan.tagline}
        className={`${ADMIN_INPUT} mb-3`}
      />
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${fieldId}-price`} className={ADMIN_LABEL}>
            {t('priceLabel')}
          </label>
          <input
            id={`${fieldId}-price`}
            name="price"
            defaultValue={String(Math.round(plan.priceCents / 100))}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
            }}
            inputMode="numeric"
            required
            className={`${ADMIN_INPUT} font-led`}
          />
        </div>
        <div>
          <label htmlFor={`${fieldId}-unit`} className={ADMIN_LABEL}>
            {t('unitLabel')}
          </label>
          <select
            id={`${fieldId}-unit`}
            name="unit"
            defaultValue={plan.unit}
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
      <label htmlFor={`${fieldId}-features`} className={ADMIN_LABEL}>
        {t('featuresLabel')}
      </label>
      <textarea
        id={`${fieldId}-features`}
        name="features"
        defaultValue={plan.features.join('\n')}
        rows={4}
        className={`${ADMIN_INPUT} mb-3 resize-y leading-relaxed`}
      />
      <label className="font-condensed text-bone/70 mb-4 flex cursor-pointer items-center gap-2 text-sm tracking-wider uppercase">
        <input
          type="checkbox"
          name="popular"
          defaultChecked={plan.popular}
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
