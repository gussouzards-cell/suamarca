import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  streaming_url?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  volume?: number;

  @IsString()
  @IsOptional()
  status?: string; // 'active' ou 'inactive'

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  mac_address?: string;

  @IsString()
  @IsOptional()
  company_id?: string;

  @IsString()
  @IsOptional()
  player_type?: string; // 'webView' ou 'exoPlayer'
}


