import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteCommandsService } from './remote-commands.service';
import { RemoteCommandsController } from './remote-commands.controller';
import { RemoteCommand } from './entities/remote-command.entity';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteCommand]),
    DevicesModule,
  ],
  controllers: [RemoteCommandsController],
  providers: [RemoteCommandsService],
  exports: [RemoteCommandsService],
})
export class RemoteCommandsModule {}






