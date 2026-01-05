import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { DeviceGroupsService } from './device-groups.service'
import { CreateDeviceGroupDto } from './dto/create-device-group.dto'
import { UpdateDeviceGroupDto } from './dto/update-device-group.dto'

@Controller('device-groups')
export class DeviceGroupsController {
  constructor(private readonly groupsService: DeviceGroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateDeviceGroupDto) {
    return this.groupsService.create(createGroupDto)
  }

  @Get()
  findAll() {
    return this.groupsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateDeviceGroupDto) {
    return this.groupsService.update(id, updateGroupDto)
  }

  @Post(':id/devices')
  addDevices(@Param('id') id: string, @Body() body: { device_ids: string[] }) {
    return this.groupsService.addDevicesToGroup(id, body.device_ids)
  }

  @Delete(':id/devices')
  removeDevices(@Param('id') id: string, @Body() body: { device_ids: string[] }) {
    return this.groupsService.removeDevicesFromGroup(id, body.device_ids)
  }

  @Post(':id/apply-action')
  applyAction(
    @Param('id') id: string,
    @Body() body: { action: string; value: any },
  ) {
    return this.groupsService.applyActionToGroup(id, body.action, body.value)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id)
  }
}






