import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ['devices'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['devices'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async getCompanyDevices(id: string) {
    const company = await this.findOne(id);
    return company.devices || [];
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }

  async updateMonthlyRevenue(companyId: string): Promise<Company> {
    const company = await this.findOne(companyId);
    
    // Buscar assinatura ativa
    const subscription = await this.subscriptionsService.findByCompany(companyId);
    
    if (subscription && subscription.status === 'active') {
      company.monthly_revenue = Number(subscription.monthly_amount);
      company.last_payment_date = subscription.last_payment_date || new Date();
      company.payment_status = 'paid';
    } else {
      company.monthly_revenue = 0;
      company.payment_status = 'pending';
    }
    
    return this.companyRepository.save(company);
  }

  async updateAllMonthlyRevenues(): Promise<void> {
    const companies = await this.findAll();
    
    for (const company of companies) {
      await this.updateMonthlyRevenue(company.id);
    }
  }
}
