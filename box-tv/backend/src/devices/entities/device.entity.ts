import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uuid: string;

  @Column({ nullable: true })
  nome: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  mac_address: string;

  @Column({ nullable: true })
  streaming_url: string;

  @Column({ default: 50 })
  volume: number;

  @Column({ default: 'inactive' })
  status: string; // 'active' ou 'inactive'

  @Column({ default: 'webView' })
  player_type: string; // 'webView' ou 'exoPlayer'

  @Column({ type: 'timestamp', nullable: true })
  last_heartbeat: Date;

  @Column({ nullable: true })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.devices, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
