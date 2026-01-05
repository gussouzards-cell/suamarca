import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string; // Nome da empresa

  @Column({ nullable: true })
  descricao: string; // Descrição opcional

  @Column({ nullable: true })
  contato: string; // Contato/telefone

  @Column({ nullable: true })
  endereco: string; // Endereço opcional

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthly_revenue: number; // Receita mensal da empresa

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_status: string; // 'paid', 'pending', 'overdue', 'suspended'

  @Column({ type: 'timestamp', nullable: true })
  last_payment_date: Date | null;

  @OneToMany(() => Device, (device) => device.company)
  devices: Device[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

