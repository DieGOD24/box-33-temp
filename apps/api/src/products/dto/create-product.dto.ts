import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator'
import type { ProductCategory, ProductGender } from '@box33/types'

export const PRODUCT_GENDERS: readonly ProductGender[] = ['m', 'h'] as const

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'tops',
  'shorts',
  'camisetas',
  'pantalonetas',
  'otros',
] as const

export class CreateProductDto {
  @IsString()
  @Length(2, 120)
  name: string

  @IsIn(PRODUCT_GENDERS)
  gender: ProductGender

  @IsIn(PRODUCT_CATEGORIES)
  category: ProductCategory

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number | null

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[]

  @IsOptional()
  @IsBoolean()
  featured?: boolean

  @IsOptional()
  @IsBoolean()
  soldOut?: boolean

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
