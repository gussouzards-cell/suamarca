import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common'
import { AlertsService } from './alerts.service'
import { CreateAlertDto } from './dto/create-alert.dto'

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto)
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('type') type?: string, @Query('device_uuid') device_uuid?: string) {
    return this.alertsService.findAll({ status, type, device_uuid })
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: string) {
    return this.alertsService.findRecent(limit ? parseInt(limit) : 50)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id)
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id') id: string) {
    return this.alertsService.acknowledge(id)
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id)
  }
}






