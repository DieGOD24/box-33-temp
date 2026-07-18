import type { PodiumEntry, PodiumMention } from '@box33/types'
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('podium')
export class Podium {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', default: '' })
  month: string

  @Column({ type: 'jsonb', default: () => "'[]'" })
  entries: PodiumEntry[]

  @Column({ type: 'jsonb', default: () => "'[]'" })
  mentions: PodiumMention[]

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
