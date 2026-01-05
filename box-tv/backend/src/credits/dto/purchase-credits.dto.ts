import { IsNotEmpty, IsInt, Min, IsOptional, IsString, IsNumber } from 'class-validator';

export class PurchaseCreditsDto {
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amount: number; // Quantidade de créditos a comprar

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number; // Valor pago

  @IsOptional()
  @IsString()
  payment_method?: string; // 'credit_card', 'pix', 'bank_transfer', 'cash'

  @IsOptional()
  @IsString()
  payment_reference?: string; // Referência do pagamento externo

  @IsOptional()
  @IsString()
  description?: string;
}






