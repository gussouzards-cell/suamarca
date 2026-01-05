import { IsString, IsOptional, IsEnum, IsBoolean, Matches } from 'class-validator'

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(['volume', 'stream_url', 'status', 'restart'])
  type?: string

  @IsOptional()
  @IsString()
  device_uuid?: string

  @IsOptional()
  @IsString()
  company_id?: string

  @IsOptional()
  @IsString()
  value?: string

  @IsOptional()
  @IsString()
  @Matches(/^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/, {
    message: 'Cron expression inválida. Use formato: minuto hora dia mês dia-semana'
  })
  cron_expression?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

