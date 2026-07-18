'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { SiteSettings } from '@box33/types'
import { buildWaLink } from '@/lib/wa'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { saveSettings } from './actions'

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const t = useTranslations('admin.settings')
  const tw = useTranslations('whatsapp')
  const tCommon = useTranslations('common')
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber)
  const [instagramHandle, setInstagramHandle] = useState(initial.instagramHandle)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveSettings({
        whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
        instagramHandle: instagramHandle.replace(/^@/, '').trim(),
      })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <form onSubmit={submit} className={ADMIN_CARD}>
      <label htmlFor="set-wa" className={ADMIN_LABEL}>
        {t('whatsappLabel')}
      </label>
      <input
        id="set-wa"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        inputMode="tel"
        required
        className={`${ADMIN_INPUT} mb-4`}
      />
      <label htmlFor="set-ig" className={ADMIN_LABEL}>
        {t('instagramLabel')}
      </label>
      <input
        id="set-ig"
        value={instagramHandle}
        onChange={(e) => setInstagramHandle(e.target.value)}
        required
        className={`${ADMIN_INPUT} mb-4`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={ADMIN_SAVE}>
          {pending ? tCommon('saving') : tCommon('save')}
        </button>
        <a
          href={buildWaLink(whatsappNumber, tw('trial'))}
          target="_blank"
          rel="noopener noreferrer"
          className="border-wa font-condensed text-wa hover:bg-wa hover:text-surface-dark inline-flex items-center gap-[9px] border px-5 py-[11px] text-[15px] font-semibold tracking-[2px] uppercase transition-colors"
        >
          <WhatsAppIcon size={16} />
          {t('testLink')}
        </a>
      </div>
    </form>
  )
}
