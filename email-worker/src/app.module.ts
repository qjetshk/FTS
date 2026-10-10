import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
      }),
    }),
    EmailModule,
  ],
})
export class AppModule {}
