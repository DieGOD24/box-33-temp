import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order

  @Column({ type: 'uuid', nullable: true })
  productId: string | null

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', nullable: true })
  size: string | null

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'int' })
  unitPriceCents: number

  @Column({ type: 'int' })
  subtotalCents: number
}
