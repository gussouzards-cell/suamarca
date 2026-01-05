import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para o painel admin
  app.enableCors({
    origin: process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
    credentials: true,
  });
  
  // Validação global
  app.useGlobalPipes(new ValidationPipe());
  
  // Prefixo da API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend rodando em http://localhost:${port}`);
}

bootstrap();







