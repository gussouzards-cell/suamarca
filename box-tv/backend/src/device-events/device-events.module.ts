import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEventsService } from './device-events.service';
import { DeviceEventsController } from './device-events.controller';
import { DeviceEvent } from './entities/device-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEvent])],
  controllers: [DeviceEventsController],
  providers: [DeviceEventsService],
  exports: [DeviceEventsService],
})
export class DeviceEventsModule {}






