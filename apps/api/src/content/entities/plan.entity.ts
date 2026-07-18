import type { PlanKey } from '@box33/types'
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  key: PlanKey

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  tagline: string

  @Column({ type: 'int' })
  priceCents: number

  @Column({ type: 'varchar', default: 'COP' })
  currency: string

  @Column({ type: 'varchar' })
  unit: 'class' | 'month' | 'quarter'

  @Column({ type: 'jsonb', default: () => "'[]'" })
  features: string[]

  @Column({ type: 'boolean', default: false })
  popular: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
