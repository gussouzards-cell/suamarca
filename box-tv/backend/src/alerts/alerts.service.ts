import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Alert } from './entities/alert.entity'
import { CreateAlertDto } from './dto/create-alert.dto'

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertsRepository.create({
      ...createAlertDto,
      status: 'pending',
    })
    return this.alertsRepository.save(alert)
  }

  async findAll(filters?: { status?: string; type?: string; device_uuid?: string }): Promise<Alert[]> {
    const query = this.alertsRepository.createQueryBuilder('alert')

    if (filters?.status) {
      query.andWhere('alert.status = :status', { status: filters.status })
    }

    if (filters?.type) {
      query.andWhere('alert.type = :type', { type: filters.type })
    }

    if (filters?.device_uuid) {
      query.andWhere('alert.device_uuid = :device_uuid', { device_uuid: filters.device_uuid })
    }

    query.orderBy('alert.created_at', 'DESC')

    return query.getMany()
  }

  async findOne(id: string): Promise<Alert> {
    return this.alertsRepository.findOne({ where: { id } })
  }

  async findRecent(limit: number = 50): Promise<Alert[]> {
    return this.alertsRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    })
  }

  async updateStatus(id: string, status: string): Promise<Alert> {
    const alert = await this.findOne(id)
    if (!alert) {
      throw new Error('Alert not found')
    }
    alert.status = status
    return this.alertsRepository.save(alert)
  }

  async acknowledge(id: string): Promise<Alert> {
    return this.updateStatus(id, 'acknowledged')
  }

  async resolve(id: string): Promise<Alert> {
    return this.updateStatus(id, 'resolved')
  }

  // Criar alerta quando dispositivo fica offline
  async createDeviceOfflineAlert(deviceUuid: string, deviceName: string): Promise<Alert> {
    return this.create({
      type: 'device_offline',
      device_uuid: deviceUuid,
      message: `Dispositivo ${deviceName || deviceUuid} ficou offline`,
      details: `O dispositivo não enviou heartbeat há mais de 2 minutos`,
      channel: 'email',
    })
  }

  // Criar alerta quando dispositivo volta online
  async createDeviceOnlineAlert(deviceUuid: string, deviceName: string): Promise<Alert> {
    return this.create({
      type: 'device_online',
      device_uuid: deviceUuid,
      message: `Dispositivo ${deviceName || deviceUuid} voltou online`,
      details: `O dispositivo reconectou e está funcionando normalmente`,
      channel: 'email',
    })
  }

  // Criar alerta de erro de streaming
  async createStreamErrorAlert(deviceUuid: string, deviceName: string, error: string): Promise<Alert> {
    return this.create({
      type: 'stream_error',
      device_uuid: deviceUuid,
      message: `Erro de streaming no dispositivo ${deviceName || deviceUuid}`,
      details: error,
      channel: 'email',
    })
  }
}






