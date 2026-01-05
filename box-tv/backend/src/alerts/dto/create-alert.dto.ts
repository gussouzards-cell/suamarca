import { IsString, IsOptional, IsEnum } from 'class-validator'

export class CreateAlertDto {
  @IsString()
  type: string

  @IsOptional()
  @IsString()
  device_uuid?: string

  @IsString()
  message: string

  @IsOptional()
  @IsString()
  details?: string

  @IsOptional()
  @IsEnum(['email', 'sms', 'push'])
  channel?: string
}






