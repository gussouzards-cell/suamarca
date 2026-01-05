import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private creditsService: CreditsService,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.planRepository.findOne({ where: { id: dto.plan_id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.plan_id} not found`);
    }

    // Verificar se já existe assinatura ativa
    const existing = await this.subscriptionRepository.findOne({
      where: { company_id: dto.company_id, status: 'active' },
    });

    if (existing) {
      throw new Error('Company already has an active subscription');
    }

    const monthlyAmount = plan.price_per_device * dto.device_count;
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscription = this.subscriptionRepository.create({
      company_id: dto.company_id,
      plan_id: dto.plan_id,
      device_count: dto.device_count,
      monthly_amount: monthlyAmount,
      status: 'active',
      start_date: new Date(),
      next_billing_date: nextBilling,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['company', 'plan'],
      order: { created_at: 'DESC' },
    });
  }

  async findByCompany(companyId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { company_id: companyId, status: 'active' },
      relations: ['plan'],
    });
  }

  async updateDeviceCount(id: string, deviceCount: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    subscription.device_count = deviceCount;
    subscription.monthly_amount = subscription.plan.price_per_device * deviceCount;

    return this.subscriptionRepository.save(subscription);
  }

  async calculateMonthlyRevenue(month?: number, year?: number): Promise<any> {
    const query = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.company', 'company')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .where('subscription.status = :status', { status: 'active' });

    const subscriptions = await query.getMany();

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const revenueByCompany = subscriptions.map((sub) => ({
      company_id: sub.company_id,
      company_name: sub.company?.nome || 'Unknown',
      device_count: sub.device_count,
      monthly_amount: Number(sub.monthly_amount),
      plan_name: sub.plan?.name || 'Unknown',
    }));

    const totalRevenue = revenueByCompany.reduce((sum, r) => sum + r.monthly_amount, 0);

    return {
      month: targetMonth,
      year: targetYear,
      total_revenue: totalRevenue,
      company_count: revenueByCompany.length,
      companies: revenueByCompany,
    };
  }
}






