import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesSchedulerService } from './devices-scheduler.service';
import { Device } from './entities/device.entity';
import { DeviceEventsModule } from '../device-events/device-events.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    DeviceEventsModule,
    AlertsModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService, DevicesSchedulerService],
  exports: [DevicesService],
})
export class DevicesModule {}


