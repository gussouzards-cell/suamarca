import { IsOptional, IsString, IsArray } from 'class-validator';
import { CreateDeviceGroupDto } from './create-device-group.dto'

export class UpdateDeviceGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  device_ids?: string[];
}

