import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './interfaces/jwt-refresh.strategy';
import { EmailProducerModule } from 'src/email-producer/email-producer.module';

@Module({
  imports: [
    JwtModule.register({}),
    EmailProducerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
