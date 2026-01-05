import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DevicesModule } from './devices/devices.module';
import { UpdateModule } from './update/update.module';
import { DeviceEventsModule } from './device-events/device-events.module';
import { CompaniesModule } from './companies/companies.module';
import { AlertsModule } from './alerts/alerts.module';
import { SchedulesModule } from './schedules/schedules.module';
import { DeviceGroupsModule } from './device-groups/device-groups.module';
import { CreditsModule } from './credits/credits.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RemoteCommandsModule } from './remote-commands/remote-commands.module';
import { Device } from './devices/entities/device.entity';
import { DeviceEvent } from './device-events/entities/device-event.entity';
import { Company } from './companies/entities/company.entity';
import { Alert } from './alerts/entities/alert.entity';
import { Schedule } from './schedules/entities/schedule.entity';
import { DeviceGroup } from './device-groups/entities/device-group.entity';
import { Credit } from './credits/entities/credit.entity';
import { CreditTransaction } from './credits/entities/credit-transaction.entity';
import { Plan } from './plans/entities/plan.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { RemoteCommand } from './remote-commands/entities/remote-command.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'radio_indoor'),
        entities: [
          Device,
          DeviceEvent,
          Company,
          Alert,
          Schedule,
          DeviceGroup,
          Credit,
          CreditTransaction,
          Plan,
          Subscription,
          RemoteCommand,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    DevicesModule,
    UpdateModule,
    DeviceEventsModule,
    CompaniesModule,
    AlertsModule,
    SchedulesModule,
    DeviceGroupsModule,
    CreditsModule,
    PlansModule,
    SubscriptionsModule,
    RemoteCommandsModule,
  ],
})
export class AppModule {}

