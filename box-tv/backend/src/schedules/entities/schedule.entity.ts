import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ type: 'varchar', length: 50 })
  type: string // 'volume', 'stream_url', 'status', 'restart'

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_uuid: string | null // null = todos os dispositivos

  @Column({ type: 'varchar', length: 255, nullable: true })
  company_id: string | null // null = todas as empresas

  @Column({ type: 'text' })
  value: string // valor a ser aplicado (volume, URL, etc)

  @Column({ type: 'varchar', length: 50 })
  cron_expression: string // ex: "0 8 * * *" = todo dia às 8h

  @Column({ type: 'boolean', default: true })
  enabled: boolean

  @Column({ type: 'timestamp', nullable: true })
  last_executed: Date | null

  @Column({ type: 'timestamp', nullable: true })
  next_execution: Date | null

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}






