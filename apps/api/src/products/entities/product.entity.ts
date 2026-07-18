import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import type { ProductCategory, ProductGender } from '@box33/types'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', unique: true })
  slug: string

  @Column({ type: 'varchar', length: 1 })
  gender: ProductGender

  @Column({ type: 'varchar' })
  category: ProductCategory

  /** Price in COP minor units (cents). null → "ask for price" (WhatsApp only). */
  @Column({ type: 'int', nullable: true })
  priceCents: number | null

  @Column({ type: 'varchar', default: 'COP' })
  currency: string

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null

  @Column({ type: 'jsonb', default: () => "'[]'" })
  sizes: string[]

  @Column({ type: 'boolean', default: false })
  soldOut: boolean

  @Column({ type: 'boolean', default: false })
  featured: boolean

  @Column({ type: 'boolean', default: true })
  active: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
