import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from 'process';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Bull Board
  const redisConnection = {
    host: config.getOrThrow<string>('REDIS_HOST'),
    port: config.get<number>('REDIS_PORT', 6379),
    maxRetriesPerRequest: null as null,
    enableReadyCheck: false,
  };
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull-board');
  createBullBoard({
    queues: [
      new BullMQAdapter(new Queue('statform-generation', { connection: redisConnection })),
      new BullMQAdapter(new Queue('product-classification', { connection: redisConnection })),
    ],
    serverAdapter,
  });
  app.use('/bull-board', serverAdapter.getRouter());

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      config.getOrThrow<string>('FRONTEND_URL'),
      config.getOrThrow<string>('N8N_URL'),
    ],
    credentials: true,
  });

  await app.listen(env.PORT ?? 4200, '0.0.0.0');
  console.log(`app is running on ${env.PORT ?? 4200}`);
}
bootstrap();
