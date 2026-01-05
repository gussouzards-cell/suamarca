import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

export enum CommandType {
  RESTART = 'restart',
  SHUTDOWN = 'shutdown',
  REBOOT = 'reboot',
  SET_VOLUME = 'set_volume',
  SET_STREAMING_URL = 'set_streaming_url',
  SET_BRIGHTNESS = 'set_brightness',
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  UPDATE_CONFIG = 'update_config',
  SCREENSHOT = 'screenshot',
  EXECUTE_SHELL = 'execute_shell',
  INSTALL_APP = 'install_app',
  UNINSTALL_APP = 'uninstall_app',
  CLEAR_CACHE = 'clear_cache',
  FORCE_STOP = 'force_stop',
  ENABLE_WIFI = 'enable_wifi',
  DISABLE_WIFI = 'disable_wifi',
  ENABLE_BLUETOOTH = 'enable_bluetooth',
  DISABLE_BLUETOOTH = 'disable_bluetooth',
  SET_AIRPLANE_MODE = 'set_airplane_mode',
  LOCK_SCREEN = 'lock_screen',
  UNLOCK_SCREEN = 'unlock_screen',
  SET_KIOSK_MODE = 'set_kiosk_mode',
  EXIT_KIOSK_MODE = 'exit_kiosk_mode',
  CONNECT_WIFI = 'connect_wifi',
  DISCONNECT_WIFI = 'disconnect_wifi',
  LIST_WIFI_NETWORKS = 'list_wifi_networks',
  GET_WIFI_INFO = 'get_wifi_info',
}

export enum CommandStatus {
  PENDING = 'pending',
  SENT = 'sent',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('remote_commands')
export class RemoteCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  device_uuid: string;

  @ManyToOne(() => Device, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_uuid', referencedColumnName: 'uuid' })
  device: Device;

  @Column({ type: 'varchar', length: 50 })
  command_type: CommandType;

  @Column({ type: 'json', nullable: true })
  parameters: any; // Parâmetros do comando (ex: { volume: 50, url: '...' })

  @Column({ type: 'varchar', length: 50, default: CommandStatus.PENDING })
  status: CommandStatus;

  @Column({ type: 'text', nullable: true })
  result: string; // Resultado da execução

  @Column({ type: 'text', nullable: true })
  error_message: string; // Mensagem de erro se falhar

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  executed_at: Date | null;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  executed_by: string; // ID do usuário/admin que executou

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

