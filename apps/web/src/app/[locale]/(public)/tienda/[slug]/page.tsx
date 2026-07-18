import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ApiError } from '@/lib/api/client'
import { getProduct, getProducts, getSiteContent } from '@/lib/api/queries'
import { Link } from '@/i18n/navigation'
import { formatCOP } from '@/lib/format'
import { ProductActions } from '@/components/store/ProductActions'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

async function loadProduct(slug: string) {
  try {
    return await getProduct(slug)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const product = await loadProduct(slug)
  return { title: `${product.name} · ${t('storeTitle')}` }
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('store')

  const product = await loadProduct(slug)
  const [content, sameGender] = await Promise.all([
    getSiteContent(),
    getProducts({ gender: product.gender, limit: 5 }),
  ])
  const related = sameGender.items.filter((p) => p.id !== product.id).slice(0, 4)
  const tag = product.gender === 'm' ? t('tagWomen') : t('tagMen')

  return (
    <section className="px-[clamp(20px,5vw,64px)] py-[clamp(36px,5vw,64px)]">
      <div className="mx-auto max-w-[1150px]">
        <p className="font-condensed text-bone/50 mb-[26px] text-[15px] font-semibold tracking-[4px] uppercase">
          <Link href="/" className="text-bone/50 hover:text-moss">
            {t('breadcrumbHome')}
          </Link>{' '}
          /{' '}
          <Link href="/tienda" className="text-bone/50 hover:text-moss">
            {t('breadcrumbStore')}
          </Link>{' '}
          / <span className="text-moss">{product.name}</span>
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-[clamp(28px,5vw,64px)]">
          {/* Polaroid */}
          <div className="relative w-full max-w-[520px] -rotate-[.8deg] justify-self-center">
            <div className="absolute -top-3 left-[38px] z-[2] h-[26px] w-[104px] -rotate-[5deg] bg-[rgba(214,205,180,.8)] shadow-[0_2px_5px_rgba(0,0,0,.35)]" />
            <div className="absolute -right-2 -bottom-2.5 z-[2] h-6 w-[88px] rotate-[5deg] bg-[rgba(214,205,180,.7)] shadow-[0_2px_5px_rgba(0,0,0,.35)]" />
            <div className="bg-paper p-3.5 shadow-[0_22px_46px_rgba(0,0,0,.5)]">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#dddbd0]">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover"
                  />
                )}
                {product.soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(239,237,226,.45)]">
                    <span className="border-crimson font-display text-crimson -rotate-[14deg] border-4 bg-[rgba(255,255,255,.78)] px-6 py-2 text-4xl tracking-[5px]">
                      {t('soldOut')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info + actions */}
          <div>
            <span className="bg-moss font-condensed inline-block px-3 py-1 text-sm font-semibold tracking-[3px] text-[#171712] uppercase">
              {tag}
            </span>
            <h1 className="font-display mt-3.5 mb-2.5 text-[clamp(36px,4.6vw,60px)] leading-none tracking-wide uppercase">
              {product.name}
            </h1>
            <div className="bg-paper font-led inline-block -rotate-1 px-4 py-1.5 text-xl font-bold tracking-wide text-[#20211b] shadow-[3px_3px_0_rgba(0,0,0,.35)]">
              {product.priceCents != null ? formatCOP(product.priceCents) : t('askPrice')}
            </div>
            <p className="text-bone/75 mt-[22px] mb-[26px] max-w-[460px] text-base leading-relaxed">
              {t('detail.description')}
            </p>
            <ProductActions product={product} whatsappNumber={content.settings.whatsappNumber} />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-[clamp(56px,8vw,90px)]">
            <h2 className="font-display mb-2 text-[clamp(26px,3.4vw,40px)] tracking-wide uppercase">
              {t('detail.related')}
            </h2>
            <div className="from-frame mt-4 mb-[26px] h-2 rounded bg-gradient-to-b to-[#23241c] shadow-[0_3px_8px_rgba(0,0,0,.5)]" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-6 gap-x-5">
              {related.map((p, i) => (
                <div key={p.id} style={{ transform: `rotate(${i % 2 === 0 ? 0.7 : -0.7}deg)` }}>
                  <div className="bg-paper relative text-[#20211b] shadow-[0_12px_26px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1">
                    <div className="absolute -top-[9px] left-1/2 z-[2] h-5 w-[84px] -translate-x-1/2 -rotate-2 bg-[rgba(214,205,180,.85)] shadow-[0_2px_4px_rgba(0,0,0,.3)]" />
                    <Link href={`/tienda/${p.slug}`} className="block text-inherit">
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#dddbd0]">
                        {p.imageUrl && (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 250px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-[12px_14px_14px]">
                        <h3 className="font-condensed text-[17px] font-bold tracking-wide uppercase">
                          {p.name}
                        </h3>
                        <span className="font-led text-[13px] font-semibold text-[#4a4b42]">
                          {p.priceCents != null ? formatCOP(p.priceCents) : t('askPrice')}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
