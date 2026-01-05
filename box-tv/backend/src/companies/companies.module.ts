import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { RevenueScheduler } from './schedulers/revenue.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    SubscriptionsModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, RevenueScheduler],
  exports: [CompaniesService],
})
export class CompaniesModule {}

