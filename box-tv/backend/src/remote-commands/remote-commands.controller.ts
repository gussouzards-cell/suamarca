import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RemoteCommandsService } from './remote-commands.service';
import { CreateRemoteCommandDto, BulkRemoteCommandDto } from './dto/create-remote-command.dto';
import { CommandStatus } from './entities/remote-command.entity';

@Controller('remote-commands')
export class RemoteCommandsController {
  constructor(private readonly remoteCommandsService: RemoteCommandsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createDto: CreateRemoteCommandDto) {
    console.log('📥 Recebendo comando remoto:', createDto);
    return this.remoteCommandsService.create(createDto);
  }

  @Post('bulk')
  @UsePipes(new ValidationPipe())
  createBulk(@Body() bulkDto: BulkRemoteCommandDto) {
    return this.remoteCommandsService.createBulk(bulkDto);
  }

  @Get()
  findAll(
    @Query('device_uuid') deviceUuid?: string,
    @Query('status') status?: CommandStatus,
    @Query('limit') limit?: number,
  ) {
    return this.remoteCommandsService.findAll(
      deviceUuid,
      status,
      limit ? parseInt(limit.toString()) : 100,
    );
  }

  @Get('pending/:deviceUuid')
  findPending(@Param('deviceUuid') deviceUuid: string) {
    console.log('🔍 Buscando comandos pendentes para dispositivo:', deviceUuid);
    return this.remoteCommandsService.findPending(deviceUuid);
  }

  @Get('stats')
  getStats(@Query('device_uuid') deviceUuid?: string) {
    return this.remoteCommandsService.getCommandStats(deviceUuid);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CommandStatus,
    @Body('result') result?: string,
    @Body('error_message') errorMessage?: string,
  ) {
    return this.remoteCommandsService.updateStatus(id, status, result, errorMessage);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.remoteCommandsService.cancel(id);
  }
}

