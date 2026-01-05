import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * Cria uma nova empresa
   */
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  /**
   * Lista todas as empresas
   */
  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  /**
   * Obtém uma empresa específica
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  /**
   * Lista dispositivos de uma empresa
   */
  @Get(':id/devices')
  async getDevices(@Param('id') id: string) {
    return this.companiesService.getCompanyDevices(id);
  }

  /**
   * Atualiza uma empresa
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  /**
   * Remove uma empresa
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.companiesService.remove(id);
  }
}






