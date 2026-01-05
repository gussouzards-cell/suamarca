import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DevicesService } from './devices.service';

@Injectable()
export class DevicesSchedulerService implements OnModuleInit {
  constructor(private readonly devicesService: DevicesService) {}

  onModuleInit() {
    // Verifica desconexões imediatamente ao iniciar
    this.checkDisconnectedDevices();
  }

  /**
   * Verifica dispositivos desconectados a cada 5 minutos
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDisconnectedDevices() {
    await this.devicesService.checkDisconnectedDevices();
  }
}

