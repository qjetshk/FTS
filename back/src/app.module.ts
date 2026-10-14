import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './guards/throttler.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { ProductModule } from './product/product.module';
import { StatformModule } from './statform/statform.module';
import { TnvedModule } from './tnved/tnved.module';
import { NotificationModule } from './notification/notification.module';
import { TelegramModule } from './telegram/telegram.module';
import { DEFAULT_JOB_OPTIONS } from './queue/queue.constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // лимит по IP на все эндпоинты (точечные строже — @Throttle). Хранилище в памяти: один инстанс бэка;
    // при масштабировании — Redis-хранилище, иначе лимит считается на каждый инстанс отдельно
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.getOrThrow('REDIS_HOST'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      }),
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    OrganizationModule,
    ProductModule,
    StatformModule,
    TnvedModule,
    NotificationModule,
    TelegramModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
