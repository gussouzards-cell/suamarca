import { IsString, IsOptional, IsArray } from 'class-validator'

export class CreateDeviceGroupDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  company_id?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  device_ids?: string[]
}






