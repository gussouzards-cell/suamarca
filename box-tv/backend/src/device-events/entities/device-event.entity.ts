import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

export enum EventType {
  REGISTERED = 'registered', // Dispositivo registrado
  CONNECTED = 'connected', // Dispositivo conectou
  DISCONNECTED = 'disconnected', // Dispositivo desconectou (internet caiu)
  RECONNECTED = 'reconnected', // Dispositivo reconectou após desconexão
  RESTARTED = 'restarted', // Dispositivo reiniciou
  STATUS_CHANGED = 'status_changed', // Status mudou (active/inactive)
  CONFIG_UPDATED = 'config_updated', // Configuração atualizada
  HEARTBEAT_MISSED = 'heartbeat_missed', // Heartbeat não recebido (possível problema)
}

@Entity('device_events')
export class DeviceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  device_uuid: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_uuid', referencedColumnName: 'uuid' })
  device: Device;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  event_type: EventType;

  @Column({ type: 'text', nullable: true })
  description: string; // Descrição detalhada do evento

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dados adicionais (ex: status anterior, nova URL, etc.)

  @CreateDateColumn()
  created_at: Date;
}






