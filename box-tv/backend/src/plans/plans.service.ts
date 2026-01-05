import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create({
      ...dto,
      min_devices: dto.min_devices || 0,
      credit_per_device: dto.credit_per_device || 1,
      active: dto.active !== undefined ? dto.active : true,
    });
    return this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      order: { price_per_device: 'ASC' },
    });
  }

  async findActive(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { active: true },
      order: { price_per_device: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, dto: Partial<CreatePlanDto>): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }
}






