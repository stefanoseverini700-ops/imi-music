import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.NEXT_PUBLIC_APP_ORIGIN ?? '*' });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  Logger.log(`🚀 API IMI Music in ascolto su http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
