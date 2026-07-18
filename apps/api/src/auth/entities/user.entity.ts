import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'varchar' })
  passwordHash: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', default: 'owner' })
  role: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
