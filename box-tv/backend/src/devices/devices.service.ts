import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceEventsService } from '../device-events/device-events.service';
import { EventType } from '../device-events/entities/device-event.entity';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private eventsService: DeviceEventsService,
    private alertsService: AlertsService,
  ) {}

  /**
   * Cria ou atualiza um dispositivo
   */
  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const existing = await this.deviceRepository.findOne({
      where: { uuid: createDeviceDto.uuid },
    });

    if (existing) {
      // Verifica se estava desconectado (reconexão)
      const wasDisconnected = this.isDeviceDisconnected(existing);
      
      // Atualiza se já existe
      existing.nome = createDeviceDto.nome || existing.nome;
      if (createDeviceDto.ip_address !== undefined) {
        existing.ip_address = createDeviceDto.ip_address || existing.ip_address;
      }
      if (createDeviceDto.mac_address !== undefined) {
        existing.mac_address = createDeviceDto.mac_address || existing.mac_address;
      }
      const saved = await this.deviceRepository.save(existing);

      // Registra evento de reconexão se estava desconectado
      if (wasDisconnected) {
        await this.eventsService.createEvent(
          existing.uuid,
          EventType.RECONNECTED,
          `Dispositivo reconectou após ${this.getDisconnectionDuration(existing)} minutos sem comunicação`,
          { previous_heartbeat: existing.last_heartbeat },
        );
      }

      return saved;
    }

    // Novo dispositivo
    const device = this.deviceRepository.create(createDeviceDto);
    const saved = await this.deviceRepository.save(device);

    // Registra evento de registro
    await this.eventsService.createEvent(
      saved.uuid,
      EventType.REGISTERED,
      `Dispositivo registrado: ${createDeviceDto.nome || 'Sem nome'}`,
      { nome: createDeviceDto.nome },
    );

    return saved;
  }

  /**
   * Lista todos os dispositivos
   */
  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['company'],
      order: { last_heartbeat: 'DESC' },
    });
  }

  /**
   * Obtém um dispositivo pelo UUID
   */
  async findOne(uuid: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { uuid },
      relations: ['company'],
    });

    if (!device) {
      throw new NotFoundException(`Dispositivo com UUID ${uuid} não encontrado`);
    }

    return device;
  }

  /**
   * Obtém um dispositivo pelo UUID (sem exception)
   */
  async findByUuid(uuid: string): Promise<Device | null> {
    return this.deviceRepository.findOne({
      where: { uuid },
      relations: ['company'],
    });
  }

  /**
   * Obtém dispositivos por empresa
   */
  async findByCompany(companyId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { company_id: companyId },
      relations: ['company'],
      order: { last_heartbeat: 'DESC' },
    });
  }

  /**
   * Obtém configuração do dispositivo
   */
  async getConfig(uuid: string) {
    const device = await this.findOne(uuid);
    
    return {
      streaming_url: device.streaming_url,
      volume: device.volume,
      status: device.status,
      player_type: device.player_type || 'webView', // Default para webView
    };
  }

  /**
   * Atualiza configuração do dispositivo
   */
  async update(uuid: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(uuid);
    const oldStatus = device.status;
    const oldStreamingUrl = device.streaming_url;
    const oldVolume = device.volume;

    if (updateDeviceDto.streaming_url !== undefined) {
      device.streaming_url = updateDeviceDto.streaming_url;
    }
    if (updateDeviceDto.volume !== undefined) {
      device.volume = updateDeviceDto.volume;
    }
    if (updateDeviceDto.status !== undefined) {
      device.status = updateDeviceDto.status;
    }
    if (updateDeviceDto.nome !== undefined) {
      device.nome = updateDeviceDto.nome;
    }
    if (updateDeviceDto.ip_address !== undefined) {
      device.ip_address = updateDeviceDto.ip_address || null;
    }
    if (updateDeviceDto.mac_address !== undefined) {
      device.mac_address = updateDeviceDto.mac_address || null;
    }
    if (updateDeviceDto.company_id !== undefined) {
      device.company_id = updateDeviceDto.company_id || null;
    }
    if (updateDeviceDto.player_type !== undefined) {
      device.player_type = updateDeviceDto.player_type;
    }

    const saved = await this.deviceRepository.save(device);

    // Registra eventos de mudança
    if (updateDeviceDto.status !== undefined && oldStatus !== device.status) {
      await this.eventsService.createEvent(
        uuid,
        EventType.STATUS_CHANGED,
        `Status alterado de "${oldStatus}" para "${device.status}"`,
        { old_status: oldStatus, new_status: device.status },
      );
    }

    if (updateDeviceDto.streaming_url !== undefined && oldStreamingUrl !== device.streaming_url) {
      await this.eventsService.createEvent(
        uuid,
        EventType.CONFIG_UPDATED,
        `URL de streaming atualizada`,
        { old_url: oldStreamingUrl, new_url: device.streaming_url },
      );
    }

    if (updateDeviceDto.volume !== undefined && oldVolume !== device.volume) {
      await this.eventsService.createEvent(
        uuid,
        EventType.CONFIG_UPDATED,
        `Volume alterado de ${oldVolume}% para ${device.volume}%`,
        { old_volume: oldVolume, new_volume: device.volume },
      );
    }

    return saved;
  }

  /**
   * Atualiza heartbeat (último contato)
   */
  async updateHeartbeat(uuid: string): Promise<void> {
    const device = await this.findOne(uuid);
    const wasDisconnected = this.isDeviceDisconnected(device);
    
    device.last_heartbeat = new Date();
    await this.deviceRepository.save(device);

    // Se estava desconectado e agora conectou, registra reconexão
    if (wasDisconnected) {
      await this.eventsService.createEvent(
        uuid,
        EventType.RECONNECTED,
        `Dispositivo reconectou após ${this.getDisconnectionDuration(device)} minutos sem comunicação`,
        { previous_heartbeat: device.last_heartbeat },
      );
      // Criar alerta de reconexão
      await this.alertsService.createDeviceOnlineAlert(uuid, device.nome || 'Desconhecido');
    } else if (!device.last_heartbeat || this.getMinutesSinceLastHeartbeat(device) > 5) {
      // Primeira conexão ou reconexão após muito tempo
      await this.eventsService.createEvent(
        uuid,
        EventType.CONNECTED,
        'Dispositivo conectado',
      );
    }
  }

  /**
   * Verifica se dispositivo está desconectado (sem heartbeat há mais de 5 minutos)
   */
  private isDeviceDisconnected(device: Device): boolean {
    if (!device.last_heartbeat) return true;
    return this.getMinutesSinceLastHeartbeat(device) > 5;
  }

  /**
   * Calcula minutos desde último heartbeat
   */
  private getMinutesSinceLastHeartbeat(device: Device): number {
    if (!device.last_heartbeat) return Infinity;
    const diff = new Date().getTime() - device.last_heartbeat.getTime();
    return Math.floor(diff / 60000); // minutos
  }

  /**
   * Calcula duração da desconexão em minutos
   */
  private getDisconnectionDuration(device: Device): number {
    return this.getMinutesSinceLastHeartbeat(device);
  }

  /**
   * Verifica dispositivos desconectados e registra eventos
   * Deve ser chamado periodicamente (scheduler)
   */
  async checkDisconnectedDevices(): Promise<void> {
    const devices = await this.deviceRepository.find();
    const now = new Date();

    for (const device of devices) {
      if (!device.last_heartbeat) continue;

      const minutesSinceHeartbeat = this.getMinutesSinceLastHeartbeat(device);

      // Se sem heartbeat há mais de 5 minutos, verifica se já registrou desconexão
      if (minutesSinceHeartbeat > 5) {
        const lastDisconnectEvent = await this.eventsService.getLastEventByType(
          device.uuid,
          EventType.DISCONNECTED,
        );

        const lastReconnectEvent = await this.eventsService.getLastEventByType(
          device.uuid,
          EventType.RECONNECTED,
        );

        // Se não há evento de desconexão, ou se o último evento foi reconexão antes da desconexão atual
        const shouldRegisterDisconnect =
          !lastDisconnectEvent ||
          (lastReconnectEvent &&
            lastReconnectEvent.created_at > lastDisconnectEvent.created_at);

        if (shouldRegisterDisconnect) {
          await this.eventsService.createEvent(
            device.uuid,
            EventType.DISCONNECTED,
            `Dispositivo desconectado (sem heartbeat há ${minutesSinceHeartbeat} minutos). Possível queda de internet ou desligamento.`,
            {
              minutes_since_heartbeat: minutesSinceHeartbeat,
              last_heartbeat: device.last_heartbeat,
            },
          );
          // Criar alerta de desconexão
          await this.alertsService.createDeviceOfflineAlert(
            device.uuid,
            device.nome || 'Desconhecido'
          );
        }
      }
    }
  }
}


