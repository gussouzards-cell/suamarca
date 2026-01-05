import { Controller, Get } from '@nestjs/common';
import { UpdateService } from './update.service';

@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  /**
   * Verifica atualização disponível
   * Retorna informações sobre a versão mais recente do app
   */
  @Get('check')
  async checkUpdate() {
    return this.updateService.getUpdateInfo();
  }
}







