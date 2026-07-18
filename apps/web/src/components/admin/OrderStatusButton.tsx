'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { markOrderStatus } from './actions'

export function OrderStatusButton({ orderId, label }: { orderId: string; label: string }) {
  const tCommon = useTranslations('common')
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markOrderStatus(orderId, 'delivered')
          if (result.ok) toast.success(tCommon('saved'))
          else toast.error(result.message ?? tCommon('error'))
        })
      }
      className="border-moss/60 font-condensed text-moss hover:bg-moss/10 cursor-pointer border px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
    >
      {label}
    </button>
  )
}
