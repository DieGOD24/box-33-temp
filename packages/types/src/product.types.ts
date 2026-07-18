export type ProductGender = 'm' | 'h'

export type ProductCategory = 'tops' | 'shorts' | 'camisetas' | 'pantalonetas' | 'otros'

export interface Product {
  id: string
  name: string
  slug: string
  gender: ProductGender
  category: ProductCategory
  /** Price in currency minor units (COP cents). null → "ask for price" (WhatsApp only). */
  priceCents: number | null
  currency: string
  imageUrl: string | null
  sizes: string[]
  soldOut: boolean
  featured: boolean
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductListQuery {
  gender?: ProductGender
  category?: ProductCategory
  q?: string
  page?: number
  limit?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface CreateProductInput {
  name: string
  gender: ProductGender
  category: ProductCategory
  priceCents?: number | null
  imageUrl?: string | null
  sizes?: string[]
  featured?: boolean
  soldOut?: boolean
  active?: boolean
  sortOrder?: number
}

export type UpdateProductInput = Partial<CreateProductInput>
