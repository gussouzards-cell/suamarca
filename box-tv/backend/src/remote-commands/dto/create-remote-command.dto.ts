import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum, IsArray } from 'class-validator';
import { CommandType } from '../entities/remote-command.entity';

export class CreateRemoteCommandDto {
  @IsNotEmpty()
  @IsString()
  device_uuid: string;

  @IsNotEmpty()
  @IsEnum(CommandType)
  command_type: CommandType;

  @IsOptional()
  @IsObject()
  parameters?: any;

  @IsOptional()
  @IsString()
  executed_by?: string;
}

export class BulkRemoteCommandDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  device_uuids?: string[];

  @IsOptional()
  @IsString()
  company_id?: string;

  @IsNotEmpty()
  @IsEnum(CommandType)
  command_type: CommandType;

  @IsOptional()
  @IsObject()
  parameters?: any;

  @IsOptional()
  @IsString()
  executed_by?: string;
}






