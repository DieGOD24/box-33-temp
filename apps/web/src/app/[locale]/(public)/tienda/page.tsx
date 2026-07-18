import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ProductCategory, ProductGender } from '@box33/types'
import { getProducts, getSiteContent } from '@/lib/api/queries'
import { Link } from '@/i18n/navigation'
import { buildWaLink } from '@/lib/wa'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { Filters } from '@/components/store/Filters'
import { ProductCard } from '@/components/store/ProductCard'
import { Pagination } from '@/components/store/Pagination'

const PAGE_SIZE = 12
const CATEGORIES: ProductCategory[] = ['tops', 'shorts', 'camisetas', 'pantalonetas']

interface StoreSearchParams {
  q?: string
  genero?: string
  categoria?: string
  pagina?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('storeTitle'), description: t('storeDescription') }
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<StoreSearchParams>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const t = await getTranslations('store')

  const gender: ProductGender | undefined =
    sp.genero === 'mujer' ? 'm' : sp.genero === 'hombre' ? 'h' : undefined
  const category = CATEGORIES.includes(sp.categoria as ProductCategory)
    ? (sp.categoria as ProductCategory)
    : undefined
  const page = Math.max(1, parseInt(sp.pagina ?? '1', 10) || 1)

  const [result, content] = await Promise.all([
    getProducts({ gender, category, q: sp.q, page, limit: PAGE_SIZE }),
    getSiteContent(),
  ])
  const from = result.total === 0 ? 0 : (result.page - 1) * result.limit + 1
  const to = Math.min(result.page * result.limit, result.total)

  return (
    <>
      <section className="from-carbon-deep to-carbon bg-gradient-to-b px-[clamp(20px,5vw,64px)] pt-[clamp(40px,6vw,72px)]">
        <div className="mx-auto max-w-[1280px]">
          <p className="font-condensed text-bone/50 mb-2 text-[15px] font-semibold tracking-[4px] uppercase">
            <Link href="/" className="text-bone/50 hover:text-moss">
              {t('breadcrumbHome')}
            </Link>{' '}
            / {t('breadcrumbStore')}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-[18px]">
            <div>
              <h1 className="font-display text-[clamp(44px,6vw,80px)] tracking-wide uppercase">
                {t('title')}
              </h1>
              <p className="text-bone/70 mt-2 max-w-[520px] text-[17px] leading-normal">
                {t('subtitle')}
              </p>
            </div>
            <span className="font-led text-ember text-[15px] font-semibold tracking-[2px] [text-shadow:0_0_10px_rgba(255,90,60,.5)]">
              {t('resultCount', { count: result.total })}
            </span>
          </div>
          <div className="from-frame mt-[26px] h-2.5 rounded-[5px] bg-gradient-to-b to-[#23241c] shadow-[0_3px_8px_rgba(0,0,0,.5)]" />
          <Filters />
        </div>
      </section>

      <section className="px-[clamp(20px,5vw,64px)] pt-[30px] pb-[clamp(64px,8vw,100px)]">
        <div className="mx-auto max-w-[1280px]">
          {result.total > 0 ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] gap-[26px_20px]">
                {result.items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    whatsappNumber={content.settings.whatsappNumber}
                  />
                ))}
              </div>
              <Pagination page={result.page} pages={result.pages} />
              <p className="font-condensed text-bone/45 mt-3.5 text-center text-[15px] tracking-[2px] uppercase">
                {t('pageInfo', {
                  from,
                  to,
                  total: result.total,
                  page: result.page,
                  pages: result.pages,
                })}
              </p>
            </>
          ) : (
            <div className="px-5 py-20 text-center">
              <p className="font-display text-bone/80 mb-2 text-[34px] uppercase">
                {t('emptyTitle')}
              </p>
              <p className="text-bone/55 mb-[22px] text-base">{t('emptyDescription')}</p>
              <a
                href={buildWaLink(
                  content.settings.whatsappNumber,
                  (await getTranslations('whatsapp'))('catalog')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="border-wa font-condensed text-wa hover:bg-wa inline-flex items-center gap-[9px] border px-[26px] py-[13px] text-[17px] font-semibold tracking-[2px] uppercase transition-colors hover:text-[#141510]"
              >
                <WhatsAppIcon size={17} />
                {t('emptyCta')}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
