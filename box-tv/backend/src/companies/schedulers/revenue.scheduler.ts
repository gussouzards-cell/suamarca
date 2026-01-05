import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompaniesService } from '../companies.service';

@Injectable()
export class RevenueScheduler {
  constructor(private companiesService: CompaniesService) {}

  // Atualizar receitas mensais todos os dias às 2h da manhã
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateMonthlyRevenues() {
    console.log('🔄 Atualizando receitas mensais de todas as empresas...');
    try {
      await this.companiesService.updateAllMonthlyRevenues();
      console.log('✅ Receitas mensais atualizadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar receitas mensais:', error);
    }
  }
}






