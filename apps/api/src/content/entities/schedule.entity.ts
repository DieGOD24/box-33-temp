import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'jsonb', default: () => "'[]'" })
  morning: string[]

  @Column({ type: 'jsonb', default: () => "'[]'" })
  evening: string[]

  @Column({ type: 'varchar' })
  openBoxStart: string

  @Column({ type: 'varchar' })
  openBoxEnd: string

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
