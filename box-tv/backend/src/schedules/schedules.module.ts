import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SchedulesService } from './schedules.service'
import { SchedulesController } from './schedules.controller'
import { Schedule } from './entities/schedule.entity'
import { DevicesModule } from '../devices/devices.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    DevicesModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}






