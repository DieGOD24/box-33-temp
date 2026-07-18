'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { formatCOP } from '@/lib/format'
import { useCart } from './CartProvider'

export function CartDrawer() {
  const { items, remove, setQuantity, totalCents, isOpen, close } = useCart()
  const t = useTranslations('cart')
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label={t('title')}>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <aside className="border-bone/10 bg-surface absolute top-0 right-0 bottom-0 flex w-full max-w-md flex-col border-l">
        <div className="border-bone/10 flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-display text-2xl tracking-wide uppercase">{t('title')}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('openCart')}
            autoFocus
            className="text-bone/60 hover:text-bone cursor-pointer p-1 transition-colors"
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-bone/60">{t('empty')}</p>
            <Link
              href="/tienda"
              onClick={close}
              className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss border px-6 py-3 font-semibold tracking-[2px] uppercase"
            >
              {t('emptyCta')}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-auto px-6 py-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}|${item.size ?? ''}`}
                  className="border-bone/10 flex items-center gap-3 border-b border-dashed py-3"
                >
                  <div className="relative h-16 w-[52px] flex-none overflow-hidden bg-[#dddbd0]">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="52px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-condensed truncate text-[15px] font-bold tracking-wide uppercase">
                      {item.name}
                    </p>
                    <p className="text-bone/50 text-xs">
                      {item.size ? t('size', { size: item.size }) : t('noSize')}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="-"
                        onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                        className="border-bone/25 text-bone/70 hover:border-moss hover:text-moss cursor-pointer border p-1"
                      >
                        <Minus size={12} aria-hidden />
                      </button>
                      <span className="font-led w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                        className="border-bone/25 text-bone/70 hover:border-moss hover:text-moss cursor-pointer border p-1"
                      >
                        <Plus size={12} aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-led text-sm font-semibold">
                      {formatCOP(item.priceCents * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.productId, item.size)}
                      className="text-bone/40 hover:text-ember cursor-pointer text-xs tracking-wider uppercase"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-bone/10 border-t px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-condensed text-bone/60 text-sm font-semibold tracking-[3px] uppercase">
                  {t('total')}
                </span>
                <span className="font-led text-bone text-2xl font-bold">
                  {formatCOP(totalCents)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  close()
                  router.push('/checkout')
                }}
                className="bg-bone font-condensed mb-2 w-full cursor-pointer px-6 py-4 text-center text-lg font-bold tracking-[2.5px] text-[#20211b] uppercase shadow-[5px_5px_0_rgba(0,0,0,.4)] transition-colors hover:bg-white"
              >
                {t('checkout')}
              </button>
              <button
                type="button"
                onClick={close}
                className="font-condensed text-bone/60 hover:text-bone w-full cursor-pointer px-6 py-2 text-center text-sm font-semibold tracking-[2px] uppercase"
              >
                {t('continueShopping')}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
