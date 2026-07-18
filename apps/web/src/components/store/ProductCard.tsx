import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Product } from '@box33/types'
import { Link } from '@/i18n/navigation'
import { buildWaLink } from '@/lib/wa'
import { formatCOP } from '@/lib/format'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

export async function ProductCard({
  product,
  index,
  whatsappNumber,
}: {
  product: Product
  index: number
  whatsappNumber: string
}) {
  const t = await getTranslations('store')
  const tw = await getTranslations('whatsapp')
  const tag = product.gender === 'm' ? t('tagWomen') : t('tagMen')
  const priceSuffix = product.priceCents != null ? `, ${formatCOP(product.priceCents)}` : ''
  const waHref = buildWaLink(
    whatsappNumber,
    tw('product', { name: product.name, tag, price: priceSuffix })
  )

  return (
    <div style={{ transform: `rotate(${index % 2 === 0 ? 0.7 : -0.7}deg)` }}>
      <div className="bg-paper relative flex h-full flex-col text-[#20211b] shadow-[0_12px_26px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1">
        <div className="absolute -top-[9px] left-1/2 z-[2] h-5 w-[84px] -translate-x-1/2 -rotate-2 bg-[rgba(214,205,180,.85)] shadow-[0_2px_4px_rgba(0,0,0,.3)]" />
        <Link href={`/tienda/${product.slug}`} className="block text-inherit">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#dddbd0]">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 260px"
                className="object-cover"
              />
            )}
            {product.soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(239,237,226,.45)]">
                <span className="border-crimson font-display text-crimson -rotate-[14deg] border-[3px] bg-white/75 px-4 py-[5px] text-2xl tracking-[4px]">
                  {t('soldOut')}
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-1 flex-col justify-between gap-2.5 p-[14px_14px_16px]">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-condensed text-lg leading-tight font-bold tracking-wide uppercase">
                {product.name}
              </h3>
              <span className="font-condensed text-xs font-semibold tracking-[2px] whitespace-nowrap text-[#8a8a80] uppercase">
                {tag}
              </span>
            </div>
            <div className="font-led text-paper mt-1.5 inline-block -rotate-1 bg-[#20211b] px-2.5 py-[3px] text-sm font-semibold tracking-wide">
              {product.priceCents != null ? formatCOP(product.priceCents) : t('askPrice')}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/tienda/${product.slug}`}
              className="bg-olive-deep font-condensed hover:bg-olive flex flex-1 items-center justify-center py-2.5 text-[15px] font-semibold tracking-[2px] text-white uppercase transition-colors hover:text-white"
            >
              {t('viewItem')}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('orderWhatsApp')}
              className="border-wa text-wa hover:bg-wa hover:text-paper flex w-[42px] flex-none items-center justify-center border transition-colors"
            >
              <WhatsAppIcon size={17} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
