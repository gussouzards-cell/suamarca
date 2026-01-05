import { Controller, Get, Param, Query } from '@nestjs/common';
import { DeviceEventsService } from './device-events.service';

@Controller('devices/:uuid/events')
export class DeviceEventsController {
  constructor(private readonly eventsService: DeviceEventsService) {}

  /**
   * Lista eventos de um dispositivo
   */
  @Get()
  async getEvents(
    @Param('uuid') uuid: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.eventsService.getDeviceEvents(uuid, limitNum, offsetNum);
  }

  /**
   * Conta eventos de um dispositivo
   */
  @Get('count')
  async getEventCount(@Param('uuid') uuid: string) {
    const count = await this.eventsService.countDeviceEvents(uuid);
    return { count };
  }
}






