import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Schedule } from './entities/schedule.entity'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { DevicesService } from '../devices/devices.service'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    private devicesService: DevicesService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.schedulesRepository.create(createScheduleDto)
    const saved = await this.schedulesRepository.save(schedule)
    
    // Calcular próxima execução
    saved.next_execution = this.calculateNextExecution(saved.cron_expression)
    return this.schedulesRepository.save(saved)
  }

  async findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      order: { created_at: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Schedule> {
    return this.schedulesRepository.findOne({ where: { id } })
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id)
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    Object.assign(schedule, updateScheduleDto)
    const saved = await this.schedulesRepository.save(schedule)

    // Recalcular próxima execução
    if (saved.enabled) {
      saved.next_execution = this.calculateNextExecution(saved.cron_expression)
    }

    return this.schedulesRepository.save(saved)
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id)
    if (schedule) {
      await this.schedulesRepository.remove(schedule)
    }
  }

  async toggleEnabled(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id)
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    schedule.enabled = !schedule.enabled
    const saved = await this.schedulesRepository.save(schedule)

    // Recalcular próxima execução se habilitado
    if (saved.enabled) {
      saved.next_execution = this.calculateNextExecution(saved.cron_expression)
      return this.schedulesRepository.save(saved)
    }

    return saved
  }

  private async executeSchedule(schedule: Schedule) {
    try {
      console.log(`Executando agendamento: ${schedule.name}`)

      // Buscar dispositivos alvo
      let devices: any[] = []
      if (schedule.device_uuid) {
        const device = await this.devicesService.findOne(schedule.device_uuid)
        if (device) devices = [device]
      } else if (schedule.company_id) {
        // Buscar dispositivos da empresa
        const allDevices = await this.devicesService.findAll()
        devices = allDevices.filter(d => d.company_id === schedule.company_id)
      } else {
        // Todos os dispositivos
        devices = await this.devicesService.findAll()
      }

      // Aplicar ação em cada dispositivo
      for (const device of devices) {
        try {
          switch (schedule.type) {
            case 'volume':
              await this.devicesService.update(device.uuid, {
                volume: parseInt(schedule.value),
              })
              break
            case 'stream_url':
              await this.devicesService.update(device.uuid, {
                streaming_url: schedule.value,
              })
              break
            case 'status':
              await this.devicesService.update(device.uuid, {
                status: schedule.value as 'active' | 'inactive',
              })
              break
            case 'restart':
              // Implementar restart se houver endpoint
              console.log(`Restart agendado para dispositivo ${device.uuid}`)
              break
          }
        } catch (error) {
          console.error(`Erro ao aplicar agendamento no dispositivo ${device.uuid}:`, error)
        }
      }

      // Atualizar última execução
      schedule.last_executed = new Date()
      schedule.next_execution = this.calculateNextExecution(schedule.cron_expression)
      await this.schedulesRepository.save(schedule)

      console.log(`Agendamento ${schedule.name} executado com sucesso`)
    } catch (error) {
      console.error(`Erro ao executar agendamento ${schedule.id}:`, error)
    }
  }

  private calculateNextExecution(cronExpression: string): Date {
    // Implementação simplificada - calcular próxima execução baseada no cron
    // Para uma implementação completa, usar biblioteca como 'cron-parser'
    const now = new Date()
    // Parse básico do cron: minuto hora dia mês dia-semana
    const parts = cronExpression.split(' ')
    if (parts.length >= 2) {
      const hour = parts[1] !== '*' ? parseInt(parts[1]) : now.getHours()
      const minute = parts[0] !== '*' ? parseInt(parts[0]) : now.getMinutes()
      
      const next = new Date(now)
      next.setHours(hour, minute, 0, 0)
      
      // Se já passou hoje, agendar para amanhã
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      
      return next
    }
    
    // Fallback: +1 hora
    return new Date(now.getTime() + 60 * 60 * 1000)
  }

  // Verificar agendamentos a cada minuto
  @Cron(CronExpression.EVERY_MINUTE)
  async checkSchedules() {
    const schedules = await this.schedulesRepository.find({
      where: { enabled: true },
    })

    const now = new Date()
    for (const schedule of schedules) {
      if (schedule.next_execution && schedule.next_execution <= now) {
        await this.executeSchedule(schedule)
      }
    }
  }
}

