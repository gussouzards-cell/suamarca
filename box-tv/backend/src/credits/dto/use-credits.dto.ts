import { IsNotEmpty, IsInt, Min, IsString, IsOptional } from 'class-validator';

export class UseCreditsDto {
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  device_count: number; // Quantidade de dispositivos que usarão os créditos

  @IsOptional()
  @IsString()
  description?: string;
}

