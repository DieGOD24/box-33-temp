import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Product } from '@box33/types'
import { Link } from '@/i18n/navigation'
import { formatCOP } from '@/lib/format'
import { Reveal } from './Reveal'

export async function Featured({ products }: { products: Product[] }) {
  const t = await getTranslations('featured')
  const tStore = await getTranslations('store')

  return (
    <section className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]">
      <Reveal className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-[18px]">
          <div>
            <p className="font-condensed text-moss mb-2.5 text-base font-semibold tracking-[6px] uppercase">
              {t('kicker')}
            </p>
            <h2 className="font-display text-[clamp(36px,5vw,64px)] tracking-wide uppercase">
              {t('title')}
            </h2>
          </div>
          <Link
            href="/tienda"
            className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss inline-flex items-center gap-2 border px-6 py-3 text-[17px] font-semibold tracking-[2.5px] uppercase transition-colors"
          >
            {t('viewAll')}
          </Link>
        </div>
        {/* clothes rail */}
        <div className="from-frame mt-[26px] mb-[30px] h-2.5 rounded-[5px] bg-gradient-to-b to-[#23241c] shadow-[0_3px_8px_rgba(0,0,0,.5)]" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-6 gap-x-5">
          {products.map((product, i) => (
            <div key={product.id} style={{ transform: `rotate(${i % 2 === 0 ? 0.7 : -0.7}deg)` }}>
              <div className="bg-paper relative flex h-full flex-col text-[#20211b] shadow-[0_12px_26px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1">
                <div className="absolute -top-[9px] left-1/2 z-[2] h-5 w-[84px] -translate-x-1/2 -rotate-2 bg-[rgba(214,205,180,.85)] shadow-[0_2px_4px_rgba(0,0,0,.3)]" />
                <Link href={`/tienda/${product.slug}`} className="block text-inherit">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#dddbd0]">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 250px"
                        className="object-cover transition-transform duration-600 hover:scale-107"
                      />
                    )}
                    {product.soldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(239,237,226,.45)]">
                        <span className="border-crimson font-display text-crimson -rotate-[14deg] border-[3px] bg-white/75 px-4 py-[5px] text-2xl tracking-[4px]">
                          {tStore('soldOut')}
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
                        {product.gender === 'm' ? tStore('tagWomen') : tStore('tagMen')}
                      </span>
                    </div>
                    <div className="font-led text-paper mt-1.5 inline-block -rotate-1 bg-[#20211b] px-2.5 py-[3px] text-sm font-semibold tracking-wide">
                      {product.priceCents != null
                        ? formatCOP(product.priceCents)
                        : tStore('askPrice')}
                    </div>
                  </div>
                  <Link
                    href={`/tienda/${product.slug}`}
                    className="bg-olive-deep font-condensed hover:bg-olive flex items-center justify-center py-2.5 text-[15px] font-semibold tracking-[2px] text-white uppercase transition-colors hover:text-white"
                  >
                    {t('viewItem')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
