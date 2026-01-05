import { IsString, IsOptional } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  contato?: string;

  @IsString()
  @IsOptional()
  endereco?: string;
}






