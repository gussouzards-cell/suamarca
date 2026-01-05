import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  type: string // 'device_offline', 'device_error', 'volume_high', 'volume_low', 'stream_error'

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_uuid: string | null

  @Column({ type: 'varchar', length: 500 })
  message: string

  @Column({ type: 'text', nullable: true })
  details: string | null

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string // 'pending', 'sent', 'acknowledged', 'resolved'

  @Column({ type: 'varchar', length: 50, nullable: true })
  channel: string | null // 'email', 'sms', 'push'

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}






