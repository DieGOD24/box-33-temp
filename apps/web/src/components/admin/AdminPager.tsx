'use client'

import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'

export function AdminPager({ page, pages }: { page: number; pages: number }) {
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
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className="border-bone/25 font-condensed text-bone cursor-pointer border px-4 py-2 text-sm font-semibold tracking-[2px] uppercase disabled:pointer-events-none disabled:opacity-30"
      >
        ←
      </button>
      <span className="font-led text-bone/60 text-sm">
        {page} / {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => goTo(page + 1)}
        className="border-bone/25 font-condensed text-bone cursor-pointer border px-4 py-2 text-sm font-semibold tracking-[2px] uppercase disabled:pointer-events-none disabled:opacity-30"
      >
        →
      </button>
    </div>
  )
}
