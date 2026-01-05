import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  uuid: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  mac_address?: string;
}


