import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @IsNotEmpty()
  @IsString()
  plan_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  device_count: number;
}






