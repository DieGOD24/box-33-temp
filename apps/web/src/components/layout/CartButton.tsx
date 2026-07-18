'use client'

import { ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCart } from '@/components/store/cart/CartProvider'

export function CartButton() {
  const { count, open } = useCart()
  const t = useTranslations('cart')

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t('openCart')}
      className="border-bone/30 text-bone hover:border-moss hover:text-moss relative inline-flex h-10 w-10 cursor-pointer items-center justify-center border transition-colors"
    >
      <ShoppingBag size={18} aria-hidden />
      {count > 0 && (
        <span className="bg-ember font-led absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}
