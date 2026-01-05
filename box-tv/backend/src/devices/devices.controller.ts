import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Header,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Registra uma nova TV Box
   */
  @Post('register')
  async register(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  /**
   * Obtém configuração da TV Box pelo UUID
   */
  @Get(':uuid/config')
  async getConfig(@Param('uuid') uuid: string) {
    return this.devicesService.getConfig(uuid);
  }

  /**
   * Atualiza heartbeat (status online)
   */
  @Post(':uuid/heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Param('uuid') uuid: string) {
    await this.devicesService.updateHeartbeat(uuid);
    return { success: true };
  }

  /**
   * Atualiza configuração da TV Box
   */
  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(uuid, updateDeviceDto);
  }

  /**
   * Lista todos os dispositivos (para painel admin)
   */
  @Get()
  async findAll() {
    return this.devicesService.findAll();
  }

  /**
   * Obtém um dispositivo específico
   */
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return this.devicesService.findOne(uuid);
  }
}







