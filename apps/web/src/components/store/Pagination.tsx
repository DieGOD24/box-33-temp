'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const t = useTranslations('store')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (pages <= 1) return null

  const goTo = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (n <= 1) params.delete('pagina')
    else params.set('pagina', String(n))
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="mt-11 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className="border-bone/25 font-condensed text-bone cursor-pointer border px-[18px] py-2.5 text-[15px] font-semibold tracking-[2px] uppercase disabled:pointer-events-none disabled:opacity-30"
      >
        {t('prev')}
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => goTo(n)}
          className={cn(
            'font-led h-10 w-10 cursor-pointer border text-[15px] font-semibold transition-colors',
            n === page
              ? 'border-ember bg-ember/10 text-ember [text-shadow:0_0_10px_rgba(255,90,60,.6)]'
              : 'border-bone/25 text-bone/70 hover:border-moss hover:text-moss'
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => goTo(page + 1)}
        className="border-bone/25 font-condensed text-bone cursor-pointer border px-[18px] py-2.5 text-[15px] font-semibold tracking-[2px] uppercase disabled:pointer-events-none disabled:opacity-30"
      >
        {t('next')}
      </button>
    </div>
  )
}
