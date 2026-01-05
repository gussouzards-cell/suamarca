import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.subscriptionsService.findByCompany(companyId);
  }

  @Patch(':id/device-count')
  updateDeviceCount(
    @Param('id') id: string,
    @Body('device_count') deviceCount: number,
  ) {
    return this.subscriptionsService.updateDeviceCount(id, deviceCount);
  }

  @Get('revenue/monthly')
  getMonthlyRevenue(@Query('month') month?: number, @Query('year') year?: number) {
    return this.subscriptionsService.calculateMonthlyRevenue(
      month ? parseInt(month.toString()) : undefined,
      year ? parseInt(year.toString()) : undefined,
    );
  }
}

