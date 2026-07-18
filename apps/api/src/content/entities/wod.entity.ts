import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('wod')
export class Wod {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  title: string

  @Column({ type: 'text' })
  text: string

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
