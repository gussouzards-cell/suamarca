import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEvent, EventType } from './entities/device-event.entity';

@Injectable()
export class DeviceEventsService {
  constructor(
    @InjectRepository(DeviceEvent)
    private eventRepository: Repository<DeviceEvent>,
  ) {}

  /**
   * Cria um novo evento
   */
  async createEvent(
    deviceUuid: string,
    eventType: EventType,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<DeviceEvent> {
    const event = this.eventRepository.create({
      device_uuid: deviceUuid,
      event_type: eventType,
      description,
      metadata,
    });

    return this.eventRepository.save(event);
  }

  /**
   * Busca eventos de um dispositivo
   */
  async getDeviceEvents(
    deviceUuid: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<DeviceEvent[]> {
    return this.eventRepository.find({
      where: { device_uuid: deviceUuid },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Busca eventos por tipo
   */
  async getEventsByType(
    deviceUuid: string,
    eventType: EventType,
    limit: number = 100,
  ): Promise<DeviceEvent[]> {
    return this.eventRepository.find({
      where: {
        device_uuid: deviceUuid,
        event_type: eventType,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Busca último evento de um tipo específico
   */
  async getLastEventByType(
    deviceUuid: string,
    eventType: EventType,
  ): Promise<DeviceEvent | null> {
    return this.eventRepository.findOne({
      where: {
        device_uuid: deviceUuid,
        event_type: eventType,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Conta eventos de um dispositivo
   */
  async countDeviceEvents(deviceUuid: string): Promise<number> {
    return this.eventRepository.count({
      where: { device_uuid: deviceUuid },
    });
  }

  /**
   * Deleta eventos antigos (manutenção)
   */
  async deleteOldEvents(olderThanDays: number = 90): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const result = await this.eventRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :date', { date })
      .execute();

    return result.affected || 0;
  }
}






