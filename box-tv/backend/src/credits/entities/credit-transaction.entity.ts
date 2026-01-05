import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  company_id: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'purchase', 'usage', 'refund', 'bonus', 'expiration'

  @Column({ type: 'int' })
  amount: number; // Quantidade de créditos (positivo para compra, negativo para uso)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number; // Valor monetário da transação (se aplicável)

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string; // Descrição da transação

  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status: string; // 'pending', 'completed', 'failed', 'cancelled'

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_method: string; // 'credit_card', 'pix', 'bank_transfer', 'cash'

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_reference: string; // Referência do pagamento externo

  @Column({ type: 'int', nullable: true })
  device_count: number; // Quantidade de dispositivos envolvidos (para uso)

  @CreateDateColumn()
  created_at: Date;
}






