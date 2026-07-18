'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Wod } from '@box33/types'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { saveWod } from './actions'

export function WodForm({ initial }: { initial: Wod }) {
  const t = useTranslations('admin.wod')
  const tCommon = useTranslations('common')
  const [title, setTitle] = useState(initial.title)
  const [text, setText] = useState(initial.text)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveWod({ title, text })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[22px]">
      <form onSubmit={submit} className={ADMIN_CARD}>
        <label htmlFor="wod-title" className={ADMIN_LABEL}>
          {t('titleLabel')}
        </label>
        <input
          id="wod-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`${ADMIN_INPUT} mb-4`}
        />
        <label htmlFor="wod-text" className={ADMIN_LABEL}>
          {t('textLabel')}
        </label>
        <textarea
          id="wod-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          required
          className={`${ADMIN_INPUT} mb-4 resize-y leading-relaxed`}
        />
        <button type="submit" disabled={pending} className={ADMIN_SAVE}>
          {pending ? tCommon('saving') : tCommon('save')}
        </button>
      </form>

      {/* Live chalkboard preview */}
      <div className="relative -rotate-[.6deg]">
        <div className="border-frame bg-chalk rounded border-8 p-6 text-[#20211b] shadow-[0_18px_38px_rgba(0,0,0,.5)]">
          <div className="mb-3.5 flex items-center justify-between gap-2.5 border-b-2 border-[rgba(32,33,27,.15)] pb-2.5">
            <span className="font-marker text-olive-deep text-[21px]">{title}</span>
          </div>
          <pre className="font-marker m-0 text-[19px] leading-[1.65] whitespace-pre-wrap text-[#26271f]">
            {text}
          </pre>
        </div>
        <div className="bg-crimson absolute -top-2.5 left-[22px] h-[13px] w-[13px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,.4)]" />
        <div className="bg-olive-deep absolute -top-2.5 right-[22px] h-[13px] w-[13px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,.4)]" />
        <p className="font-condensed text-bone/40 mt-2.5 text-center text-[13px] tracking-[2px] uppercase">
          {t('preview')}
        </p>
      </div>
    </div>
  )
}
