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

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  company_id: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'int', default: 0 })
  balance: number; // Saldo de créditos disponíveis

  @Column({ type: 'int', default: 0 })
  total_purchased: number; // Total de créditos comprados (histórico)

  @Column({ type: 'int', default: 0 })
  total_used: number; // Total de créditos usados (histórico)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}






