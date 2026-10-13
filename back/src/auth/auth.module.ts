import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailCodeService } from './email-code.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './interfaces/jwt-refresh.strategy';
import { EmailProducerModule } from 'src/email-producer/email-producer.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { TelegramLoginService } from './telegram-login.service';

@Module({
  imports: [
    JwtModule.register({}),
    EmailProducerModule,
    TelegramModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailCodeService, TelegramLoginService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
