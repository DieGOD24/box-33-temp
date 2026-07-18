'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Challenge } from '@box33/types'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { saveChallenge } from './actions'

export function ChallengeForm({ initial }: { initial: Challenge }) {
  const t = useTranslations('admin.challenge')
  const tChallenge = useTranslations('challenge')
  const tCommon = useTranslations('common')
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [goal, setGoal] = useState(initial.goal)
  const [prize, setPrize] = useState(initial.prize)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveChallenge({ title, description, goal, prize })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[22px]">
      <form onSubmit={submit} className={ADMIN_CARD}>
        <label htmlFor="ch-title" className={ADMIN_LABEL}>
          {t('titleLabel')}
        </label>
        <input
          id="ch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`${ADMIN_INPUT} mb-4`}
        />
        <label htmlFor="ch-desc" className={ADMIN_LABEL}>
          {t('descriptionLabel')}
        </label>
        <textarea
          id="ch-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className={`${ADMIN_INPUT} mb-4 resize-y leading-relaxed`}
        />
        <div className="mb-4 grid grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="ch-goal" className={ADMIN_LABEL}>
              {t('goalLabel')}
            </label>
            <input
              id="ch-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              className={`${ADMIN_INPUT} font-led text-ember`}
            />
          </div>
          <div>
            <label htmlFor="ch-prize" className={ADMIN_LABEL}>
              {t('prizeLabel')}
            </label>
            <input
              id="ch-prize"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              required
              className={ADMIN_INPUT}
            />
          </div>
        </div>
        <button type="submit" disabled={pending} className={ADMIN_SAVE}>
          {pending ? tCommon('saving') : tCommon('save')}
        </button>
      </form>

      {/* Live preview */}
      <div className="bg-olive-deep relative overflow-hidden p-6">
        <span className="bg-gold font-condensed mb-3.5 inline-block -rotate-[1.6deg] px-3 py-[5px] text-xs font-bold tracking-[3px] text-[#171712] uppercase">
          {tChallenge('badge')}
        </span>
        <h3 className="font-display mb-3 text-[clamp(24px,3vw,34px)] leading-none text-white uppercase">
          {title}
        </h3>
        <p className="mb-[18px] text-[15px] leading-relaxed text-white/85">{description}</p>
        <div className="flex flex-wrap gap-2.5">
          <span className="font-led text-ember border border-white/[.18] bg-[rgba(13,14,10,.55)] px-3.5 py-2 text-lg font-bold">
            {goal}
          </span>
          <span className="font-condensed text-moss border border-white/[.18] bg-[rgba(13,14,10,.55)] px-3.5 py-2 text-[15px] font-bold tracking-wide uppercase">
            {prize}
          </span>
        </div>
        <p className="font-condensed mt-4 text-[13px] tracking-[2px] text-white/50 uppercase">
          {t('preview')}
        </p>
      </div>
    </div>
  )
}
