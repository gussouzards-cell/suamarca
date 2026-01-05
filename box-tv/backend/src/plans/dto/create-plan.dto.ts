import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price_per_device: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_devices?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_devices?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  credit_per_device?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  features?: any;
}






