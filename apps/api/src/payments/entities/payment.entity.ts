import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import type { CartSnapshotLine, PaymentStatus } from '@box33/types'

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  reference: string

  @Column({ type: 'varchar' })
  status: PaymentStatus

  @Column({ type: 'int' })
  amountCents: number

  @Column({ type: 'varchar', default: 'COP' })
  currency: string

  @Column({ type: 'uuid', nullable: true })
  orderId: string | null

  @Column({ type: 'varchar', nullable: true })
  wompiTransactionId: string | null

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null

  @Column({ type: 'varchar', nullable: true })
  customerEmail: string | null

  @Column({ type: 'varchar', nullable: true })
  customerPhone: string | null

  @Column({ type: 'jsonb', default: () => "'[]'" })
  cartSnapshot: CartSnapshotLine[]

  @Column({ type: 'timestamptz' })
  expiresAt: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
