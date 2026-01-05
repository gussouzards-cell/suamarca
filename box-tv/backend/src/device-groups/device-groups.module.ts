import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceGroupsService } from './device-groups.service'
import { DeviceGroupsController } from './device-groups.controller'
import { DeviceGroup } from './entities/device-group.entity'
import { DevicesModule } from '../devices/devices.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceGroup]),
    DevicesModule,
  ],
  controllers: [DeviceGroupsController],
  providers: [DeviceGroupsService],
  exports: [DeviceGroupsService],
})
export class DeviceGroupsModule {}






