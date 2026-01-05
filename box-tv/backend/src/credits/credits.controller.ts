import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance/:companyId')
  async getBalance(@Param('companyId') companyId: string) {
    return this.creditsService.getCreditBalance(companyId);
  }

  @Post('purchase')
  @UsePipes(new ValidationPipe())
  async purchaseCredits(@Body() dto: PurchaseCreditsDto) {
    return this.creditsService.purchaseCredits(dto);
  }

  @Post('use')
  @UsePipes(new ValidationPipe())
  async useCredits(@Body() dto: UseCreditsDto) {
    return this.creditsService.useCredits(dto);
  }

  @Get('transactions')
  async getTransactions(@Query('company_id') companyId?: string, @Query('limit') limit?: number) {
    return this.creditsService.getTransactions(companyId, limit ? parseInt(limit.toString()) : 50);
  }

  @Get('revenue/:companyId')
  async getRevenue(
    @Param('companyId') companyId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.creditsService.getCompanyRevenue(
      companyId,
      month ? parseInt(month.toString()) : undefined,
      year ? parseInt(year.toString()) : undefined,
    );
  }
}

