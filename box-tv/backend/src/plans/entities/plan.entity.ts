import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // Nome do plano (ex: "Básico", "Premium")

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_device: number; // Preço mensal por dispositivo/box

  @Column({ type: 'int', default: 0 })
  min_devices: number; // Quantidade mínima de dispositivos

  @Column({ type: 'int', nullable: true })
  max_devices: number; // Quantidade máxima de dispositivos (null = ilimitado)

  @Column({ type: 'int', default: 1 })
  credit_per_device: number; // Quantidade de créditos necessários por dispositivo

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'json', nullable: true })
  features: any; // Features do plano em JSON

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}






