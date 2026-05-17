import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { ProductModule } from './product/product.module';
import { StatformModule } from './statform/statform.module';
import { DEFAULT_JOB_OPTIONS } from './queue/queue.constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
    PrismaModule,
    AuthModule,
    OrganizationModule,
    ProductModule,
    StatformModule,
  ],
})
export class AppModule {}
