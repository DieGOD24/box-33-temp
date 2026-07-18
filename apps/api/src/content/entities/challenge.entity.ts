import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('challenge')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'varchar' })
  goal: string

  @Column({ type: 'varchar' })
  prize: string

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
