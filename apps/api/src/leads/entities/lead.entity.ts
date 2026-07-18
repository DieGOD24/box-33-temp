import type { LeadGoal } from '@box33/types'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  phone: string

  @Column({ type: 'varchar' })
  goal: LeadGoal

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
