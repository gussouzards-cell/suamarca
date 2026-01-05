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
import { Plan } from '../../plans/entities/plan.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  plan_id: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ type: 'int' })
  device_count: number; // Quantidade de dispositivos ativos

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_amount: number; // Valor mensal total

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // 'active', 'suspended', 'cancelled', 'expired'

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  next_billing_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_payment_date: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}






