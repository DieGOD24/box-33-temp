'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

const GENDERS = ['todo', 'mujer', 'hombre'] as const
const CATEGORIES = ['todas', 'tops', 'shorts', 'camisetas', 'pantalonetas'] as const

export function Filters() {
  const t = useTranslations('store')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const genero = searchParams.get('genero') ?? 'todo'
  const categoria = searchParams.get('categoria') ?? 'todas'

  const navigate = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '' || value === 'todo' || value === 'todas') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('pagina') // any filter change resets to page 1
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const onSearch = (value: string) => {
    setQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate({ q: value || null }), 350)
  }

  const genderLabel = (g: (typeof GENDERS)[number]) =>
    g === 'todo' ? t('filterAll') : g === 'mujer' ? t('filterWomen') : t('filterMen')
  const categoryLabel = (c: (typeof CATEGORIES)[number]) =>
    c === 'todas'
      ? t('categoryAll')
      : c === 'tops'
        ? t('categoryTops')
        : c === 'shorts'
          ? t('categoryShorts')
          : c === 'camisetas'
            ? t('categoryTshirts')
            : t('categoryShorts2')

  return (
    <div className="border-bone/10 flex flex-wrap items-center gap-3.5 border-b py-[22px]">
      <input
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="border-bone/25 bg-carbon-deep text-bone min-w-[220px] flex-1 border px-4 py-3 text-base"
      />
      <div className="flex flex-wrap gap-2">
        {GENDERS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => navigate({ genero: g })}
            className={cn(
              'font-condensed cursor-pointer border px-[18px] py-2.5 text-[15px] font-semibold tracking-[2px] uppercase transition-colors',
              genero === g
                ? 'border-olive bg-olive text-white'
                : 'border-bone/30 text-bone/75 hover:border-moss hover:text-moss bg-transparent'
            )}
          >
            {genderLabel(g)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => navigate({ categoria: c })}
            className={cn(
              'font-condensed cursor-pointer border border-dashed px-3.5 py-[9px] text-sm font-semibold tracking-[1.5px] uppercase transition-colors',
              categoria === c
                ? 'border-moss bg-moss/15 text-moss'
                : 'border-bone/25 text-bone/60 hover:border-moss hover:text-moss bg-transparent'
            )}
          >
            {categoryLabel(c)}
          </button>
        ))}
      </div>
    </div>
  )
}
