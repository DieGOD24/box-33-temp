'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { wipeLeads } from './actions'

export function ClearLeadsButton() {
  const t = useTranslations('admin.leads')
  const tCommon = useTranslations('common')
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(t('clearConfirm'))) {
          startTransition(async () => {
            const result = await wipeLeads()
            if (result.ok) toast.success(tCommon('saved'))
            else toast.error(result.message ?? tCommon('error'))
          })
        }
      }}
      className="border-bone/25 font-condensed text-bone/60 hover:border-ember hover:text-ember cursor-pointer border px-4 py-2 text-sm font-semibold tracking-[2px] uppercase transition-colors disabled:opacity-50"
    >
      {t('clear')}
    </button>
  )
}
