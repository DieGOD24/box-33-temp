'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Product } from '@box33/types'
import { Link, useRouter } from '@/i18n/navigation'
import { buildWaLink } from '@/lib/wa'
import { formatCOP } from '@/lib/format'
import { cn } from '@/lib/cn'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { useCart } from './cart/CartProvider'

export function ProductActions({
  product,
  whatsappNumber,
}: {
  product: Product
  whatsappNumber: string
}) {
  const t = useTranslations('store')
  const tw = useTranslations('whatsapp')
  const router = useRouter()
  const { add, open } = useCart()
  const [size, setSize] = useState<string | null>(null)

  const tag = product.gender === 'm' ? t('tagWomen') : t('tagMen')
  const priceSuffix = product.priceCents != null ? `, ${formatCOP(product.priceCents)}` : ''
  const sizeSuffix = size ? `, talla ${size}` : ''

  const restockHref = buildWaLink(whatsappNumber, tw('productRestock', { name: product.name }))
  const orderHref = buildWaLink(
    whatsappNumber,
    tw('productOrder', { name: product.name, tag, size: sizeSuffix, price: priceSuffix })
  )

  const cartItem = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    size,
    quantity: 1,
    priceCents: product.priceCents ?? 0,
    imageUrl: product.imageUrl,
  })

  const addToCart = () => {
    add(cartItem())
    toast.success(t('detail.addedToCart', { name: product.name }))
    open()
  }

  const buyNow = () => {
    add(cartItem())
    router.push('/checkout')
  }

  const buyable = !product.soldOut && product.priceCents != null

  return (
    <div>
      {product.sizes.length > 0 && (
        <>
          <p className="font-condensed text-bone/55 mb-2.5 text-sm font-semibold tracking-[3px] uppercase">
            {size ? t('detail.sizeChosen', { size }) : t('detail.sizePrompt')}
          </p>
          <div className="mb-7 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(size === s ? null : s)}
                className={cn(
                  'font-condensed h-[46px] w-[52px] cursor-pointer border-2 text-base font-bold tracking-wide transition-colors',
                  size === s
                    ? 'border-moss bg-moss/[.18] text-moss'
                    : 'border-bone/30 text-bone hover:border-moss bg-transparent'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        {product.soldOut ? (
          <a
            href={restockHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-wa font-condensed inline-flex items-center gap-2.5 px-[30px] py-4 text-[19px] font-bold tracking-[2.5px] text-[#111210] uppercase shadow-[4px_4px_0_rgba(0,0,0,.4)] hover:bg-[#3ce07a] hover:text-[#111210]"
          >
            <WhatsAppIcon size={20} />
            {t('detail.notifyCta')}
          </a>
        ) : buyable ? (
          <>
            <button
              type="button"
              onClick={addToCart}
              className="bg-bone font-condensed inline-flex cursor-pointer items-center gap-2.5 px-[30px] py-4 text-[19px] font-bold tracking-[2.5px] text-[#20211b] uppercase shadow-[4px_4px_0_rgba(0,0,0,.4)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white"
            >
              {t('detail.addToCart')}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="bg-olive-deep font-condensed hover:bg-olive inline-flex cursor-pointer items-center gap-2.5 px-[30px] py-4 text-[19px] font-bold tracking-[2.5px] text-white uppercase transition-colors"
            >
              {t('detail.buyNow')}
            </button>
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('detail.orderCta')}
              className="border-wa font-condensed text-wa hover:bg-wa inline-flex items-center gap-2.5 border px-5 py-4 text-[19px] font-semibold tracking-[2px] uppercase transition-colors hover:text-[#141510]"
            >
              <WhatsAppIcon size={20} />
            </a>
          </>
        ) : (
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-wa font-condensed inline-flex items-center gap-2.5 px-[30px] py-4 text-[19px] font-bold tracking-[2.5px] text-[#111210] uppercase shadow-[4px_4px_0_rgba(0,0,0,.4)] hover:bg-[#3ce07a] hover:text-[#111210]"
          >
            <WhatsAppIcon size={20} />
            {t('detail.orderCta')}
          </a>
        )}
        <Link
          href="/tienda"
          className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss inline-flex items-center border px-[26px] py-4 text-[19px] font-semibold tracking-[2.5px] uppercase transition-colors"
        >
          {t('detail.keepLooking')}
        </Link>
      </div>
    </div>
  )
}
