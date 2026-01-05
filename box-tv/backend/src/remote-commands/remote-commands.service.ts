import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RemoteCommand, CommandType, CommandStatus } from './entities/remote-command.entity';
import { CreateRemoteCommandDto, BulkRemoteCommandDto } from './dto/create-remote-command.dto';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class RemoteCommandsService {
  constructor(
    @InjectRepository(RemoteCommand)
    private commandRepository: Repository<RemoteCommand>,
    private devicesService: DevicesService,
  ) {}

  async create(dto: CreateRemoteCommandDto): Promise<RemoteCommand> {
    console.log('📝 Criando comando remoto:', dto);
    
    // Verificar se o dispositivo existe
    const device = await this.devicesService.findByUuid(dto.device_uuid);
    if (!device) {
      console.error('❌ Dispositivo não encontrado:', dto.device_uuid);
      throw new NotFoundException(`Device with UUID ${dto.device_uuid} not found`);
    }

    console.log('✅ Dispositivo encontrado:', device.nome);

    // Validar parâmetros baseado no tipo de comando
    this.validateCommandParameters(dto.command_type, dto.parameters);

    const command = this.commandRepository.create({
      device_uuid: dto.device_uuid,
      command_type: dto.command_type,
      parameters: dto.parameters || {},
      status: CommandStatus.PENDING,
      executed_by: dto.executed_by,
    });

    const savedCommand = await this.commandRepository.save(command);
    console.log('✅ Comando criado com sucesso:', savedCommand.id);
    return savedCommand;
  }

  async createBulk(dto: BulkRemoteCommandDto): Promise<RemoteCommand[]> {
    let deviceUuids: string[] = [];

    if (dto.device_uuids && dto.device_uuids.length > 0) {
      deviceUuids = dto.device_uuids;
    } else if (dto.company_id) {
      const devices = await this.devicesService.findByCompany(dto.company_id);
      deviceUuids = devices.map((d) => d.uuid);
    } else {
      throw new BadRequestException('device_uuids or company_id must be provided');
    }

    if (deviceUuids.length === 0) {
      throw new BadRequestException('No devices found');
    }

    // Validar parâmetros
    this.validateCommandParameters(dto.command_type, dto.parameters);

    const commands = deviceUuids.map((uuid) =>
      this.commandRepository.create({
        device_uuid: uuid,
        command_type: dto.command_type,
        parameters: dto.parameters || {},
        status: CommandStatus.PENDING,
        executed_by: dto.executed_by,
      }),
    );

    return this.commandRepository.save(commands);
  }

  async findAll(deviceUuid?: string, status?: CommandStatus, limit = 100): Promise<RemoteCommand[]> {
    const query = this.commandRepository.createQueryBuilder('command');

    if (deviceUuid) {
      query.where('command.device_uuid = :deviceUuid', { deviceUuid });
    }

    if (status) {
      query.andWhere('command.status = :status', { status });
    }

    query
      .orderBy('command.created_at', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('command.device', 'device');

    return query.getMany();
  }

  async findPending(deviceUuid: string): Promise<RemoteCommand[]> {
    const commands = await this.commandRepository.find({
      where: {
        device_uuid: deviceUuid,
        status: CommandStatus.PENDING,
      },
      order: { created_at: 'ASC' },
    });
    console.log(`📋 Encontrados ${commands.length} comandos pendentes para dispositivo ${deviceUuid}`);
    return commands;
  }

  async updateStatus(
    id: string,
    status: CommandStatus,
    result?: string,
    errorMessage?: string,
  ): Promise<RemoteCommand> {
    const command = await this.commandRepository.findOne({ where: { id } });
    if (!command) {
      throw new NotFoundException(`Command with ID ${id} not found`);
    }

    command.status = status;
    if (result !== undefined) command.result = result;
    if (errorMessage !== undefined) command.error_message = errorMessage;

    if (status === CommandStatus.SENT) {
      command.sent_at = new Date();
    } else if (status === CommandStatus.COMPLETED || status === CommandStatus.FAILED) {
      command.executed_at = new Date();
    }

    return this.commandRepository.save(command);
  }

  async markAsSent(id: string): Promise<RemoteCommand> {
    return this.updateStatus(id, CommandStatus.SENT);
  }

  async markAsExecuting(id: string): Promise<RemoteCommand> {
    return this.updateStatus(id, CommandStatus.EXECUTING);
  }

  async markAsCompleted(id: string, result?: string): Promise<RemoteCommand> {
    return this.updateStatus(id, CommandStatus.COMPLETED, result);
  }

  async markAsFailed(id: string, errorMessage: string): Promise<RemoteCommand> {
    const command = await this.commandRepository.findOne({ where: { id } });
    if (command) {
      command.retry_count += 1;
      await this.commandRepository.save(command);
    }
    return this.updateStatus(id, CommandStatus.FAILED, undefined, errorMessage);
  }

  async cancel(id: string): Promise<RemoteCommand> {
    return this.updateStatus(id, CommandStatus.CANCELLED);
  }

  private validateCommandParameters(commandType: CommandType, parameters?: any): void {
    if (!parameters) return;

    switch (commandType) {
      case CommandType.SET_VOLUME:
        if (typeof parameters.volume !== 'number' || parameters.volume < 0 || parameters.volume > 100) {
          throw new BadRequestException('Volume must be a number between 0 and 100');
        }
        break;

      case CommandType.SET_STREAMING_URL:
        if (!parameters.url || typeof parameters.url !== 'string') {
          throw new BadRequestException('URL is required and must be a string');
        }
        break;

      case CommandType.SET_BRIGHTNESS:
        if (typeof parameters.brightness !== 'number' || parameters.brightness < 0 || parameters.brightness > 100) {
          throw new BadRequestException('Brightness must be a number between 0 and 100');
        }
        break;

      case CommandType.EXECUTE_SHELL:
        if (!parameters.command || typeof parameters.command !== 'string') {
          throw new BadRequestException('Shell command is required and must be a string');
        }
        break;

      case CommandType.INSTALL_APP:
        if (!parameters.apk_url || typeof parameters.apk_url !== 'string') {
          throw new BadRequestException('APK URL is required and must be a string');
        }
        break;

      case CommandType.UNINSTALL_APP:
        if (!parameters.package_name || typeof parameters.package_name !== 'string') {
          throw new BadRequestException('Package name is required and must be a string');
        }
        break;

      case CommandType.SET_AIRPLANE_MODE:
        if (typeof parameters.enabled !== 'boolean') {
          throw new BadRequestException('enabled must be a boolean');
        }
        break;

      case CommandType.CONNECT_WIFI:
        if (!parameters.ssid || typeof parameters.ssid !== 'string') {
          throw new BadRequestException('SSID is required and must be a string');
        }
        // Password is optional for open networks
        if (parameters.password && typeof parameters.password !== 'string') {
          throw new BadRequestException('Password must be a string');
        }
        // Security type is optional, default WPA2
        if (parameters.security_type && typeof parameters.security_type !== 'string') {
          throw new BadRequestException('Security type must be a string');
        }
        break;
    }
  }

  async getCommandStats(deviceUuid?: string): Promise<any> {
    const query = this.commandRepository.createQueryBuilder('command');

    if (deviceUuid) {
      query.where('command.device_uuid = :deviceUuid', { deviceUuid });
    }

    const total = await query.getCount();
    const pending = await query
      .andWhere('command.status = :status', { status: CommandStatus.PENDING })
      .getCount();
    const completed = await query
      .andWhere('command.status = :status', { status: CommandStatus.COMPLETED })
      .getCount();
    const failed = await query
      .andWhere('command.status = :status', { status: CommandStatus.FAILED })
      .getCount();

    return {
      total,
      pending,
      completed,
      failed,
      success_rate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }
}

