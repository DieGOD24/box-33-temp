import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  whatsappNumber: string

  @Column({ type: 'varchar' })
  instagramHandle: string

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
