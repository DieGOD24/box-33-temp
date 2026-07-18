import type { Paginated, Product, ProductListQuery, SiteContent } from '@box33/types'
import { apiFetch } from './client'

const REVALIDATE_SECONDS = 60

/** Full public site content — hero to footer. ISR-cached, tag 'content'. */
export function getSiteContent(): Promise<SiteContent> {
  return apiFetch<SiteContent>('/content', {
    revalidate: REVALIDATE_SECONDS,
    tags: ['content'],
  })
}

export function getProducts(query: ProductListQuery = {}): Promise<Paginated<Product>> {
  const params = new URLSearchParams()
  if (query.gender) params.set('gender', query.gender)
  if (query.category) params.set('category', query.category)
  if (query.q) params.set('q', query.q)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()
  return apiFetch<Paginated<Product>>(`/products${qs ? `?${qs}` : ''}`, {
    revalidate: REVALIDATE_SECONDS,
    tags: ['products'],
  })
}

export function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/featured', {
    revalidate: REVALIDATE_SECONDS,
    tags: ['products'],
  })
}

export function getProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${encodeURIComponent(slug)}`, {
    revalidate: REVALIDATE_SECONDS,
    tags: ['products'],
  })
}
