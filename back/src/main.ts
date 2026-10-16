import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { env } from 'process';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const safeEqual = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

function basicAuth(user: string, password: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const [scheme, encoded] = (req.headers.authorization ?? '').split(' ');
    const [u, p] = Buffer.from(encoded ?? '', 'base64').toString().split(':');
    if (scheme === 'Basic' && safeEqual(u ?? '', user) && safeEqual(p ?? '', password)) return next();
    res.setHeader('WWW-Authenticate', 'Basic realm="bull-board"');
    res.status(401).send('Unauthorized');
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // за ngrok / reverse-proxy: req.ip = реальный клиент из X-Forwarded-For (лимиты кодов, сессии)
  app.set('trust proxy', 1);
  // enableShutdownHooks не включаем: app.close() ждёт закрытия всех соединений, а SSE статусов прогонов
  // не закрывается никогда → при hot reload старый процесс висел вечно. 409 от Telegram после рестарта бот переживает сам.

  const config = app.get(ConfigService);

  // Bull Board — в задачах лежат коды входа из писем и API-ключи OZON: только под basic auth.
  // Без BULL_BOARD_USER/BULL_BOARD_PASSWORD панель не поднимается вовсе (раньше была открыта всем, в т.ч. через ngrok)
  const boardUser = config.get<string>('BULL_BOARD_USER');
  const boardPassword = config.get<string>('BULL_BOARD_PASSWORD');
  if (boardUser && boardPassword) {
    const redisConnection = {
      host: config.getOrThrow<string>('REDIS_HOST'),
      port: config.get<number>('REDIS_PORT', 6379),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');
    createBullBoard({
      queues: [
        new BullMQAdapter(new Queue('statform-generation', { connection: redisConnection })),
        new BullMQAdapter(new Queue('product-classification', { connection: redisConnection })),
        new BullMQAdapter(new Queue('email', { connection: redisConnection })),
      ],
      serverAdapter,
    });
    app.use('/bull-board', basicAuth(boardUser, boardPassword), serverAdapter.getRouter());
  }

  // заголовки безопасности (nosniff, frameguard, HSTS…); CSP не нужен JSON-API и сломал бы inline-скрипты Bull Board
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

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
