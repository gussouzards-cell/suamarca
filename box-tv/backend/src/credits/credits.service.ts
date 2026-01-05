import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit } from './entities/credit.entity';
import { CreditTransaction } from './entities/credit-transaction.entity';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
    @InjectRepository(CreditTransaction)
    private transactionRepository: Repository<CreditTransaction>,
  ) {}

  async getCreditBalance(companyId: string): Promise<Credit> {
    let credit = await this.creditRepository.findOne({
      where: { company_id: companyId },
    });

    if (!credit) {
      credit = this.creditRepository.create({
        company_id: companyId,
        balance: 0,
        total_purchased: 0,
        total_used: 0,
      });
      await this.creditRepository.save(credit);
    }

    return credit;
  }

  async purchaseCredits(dto: PurchaseCreditsDto): Promise<CreditTransaction> {
    const credit = await this.getCreditBalance(dto.company_id);

    // Criar transação de compra
    const transaction = this.transactionRepository.create({
      company_id: dto.company_id,
      type: 'purchase',
      amount: dto.amount,
      value: dto.value,
      payment_method: dto.payment_method || 'cash',
      payment_reference: dto.payment_reference,
      description: dto.description || `Compra de ${dto.amount} créditos`,
      status: 'completed',
    });

    await this.transactionRepository.save(transaction);

    // Atualizar saldo
    credit.balance += dto.amount;
    credit.total_purchased += dto.amount;
    await this.creditRepository.save(credit);

    return transaction;
  }

  async useCredits(dto: UseCreditsDto): Promise<CreditTransaction> {
    const credit = await this.getCreditBalance(dto.company_id);
    const creditsNeeded = dto.device_count; // 1 crédito por dispositivo

    if (credit.balance < creditsNeeded) {
      throw new BadRequestException(
        `Créditos insuficientes. Necessário: ${creditsNeeded}, Disponível: ${credit.balance}`,
      );
    }

    // Criar transação de uso
    const transaction = this.transactionRepository.create({
      company_id: dto.company_id,
      type: 'usage',
      amount: -creditsNeeded,
      device_count: dto.device_count,
      description: dto.description || `Uso de ${creditsNeeded} créditos para ${dto.device_count} dispositivo(s)`,
      status: 'completed',
    });

    await this.transactionRepository.save(transaction);

    // Atualizar saldo
    credit.balance -= creditsNeeded;
    credit.total_used += creditsNeeded;
    await this.creditRepository.save(credit);

    return transaction;
  }

  async getTransactions(companyId?: string, limit = 50): Promise<CreditTransaction[]> {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (companyId) {
      query.where('transaction.company_id = :companyId', { companyId });
    }

    query.orderBy('transaction.created_at', 'DESC').limit(limit);

    return query.getMany();
  }

  async getCompanyRevenue(companyId: string, month?: number, year?: number): Promise<any> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.company_id = :companyId', { companyId })
      .andWhere('transaction.type = :type', { type: 'purchase' })
      .andWhere('transaction.status = :status', { status: 'completed' });

    if (month && year) {
      query.andWhere(
        'EXTRACT(MONTH FROM transaction.created_at) = :month AND EXTRACT(YEAR FROM transaction.created_at) = :year',
        { month, year },
      );
    }

    const transactions = await query.getMany();
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.value || 0), 0);

    return {
      company_id: companyId,
      month: month || null,
      year: year || null,
      total_revenue: totalRevenue,
      transaction_count: transactions.length,
      transactions,
    };
  }
}






