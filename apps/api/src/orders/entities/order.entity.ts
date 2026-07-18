import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { OrderItem } from './order-item.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', default: 'paid' })
  status: string

  @Column({ type: 'int' })
  totalCents: number

  @Column({ type: 'varchar', default: 'COP' })
  currency: string

  @Column({ type: 'varchar' })
  customerName: string

  @Column({ type: 'varchar' })
  customerEmail: string

  @Column({ type: 'varchar' })
  customerPhone: string

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
