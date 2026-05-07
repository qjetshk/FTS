import { Module } from '@nestjs/common';
import { StatformService } from './statform.service';
import { StatformController } from './statform.controller';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CbrService } from './cbr.service';

@Module({
  controllers: [StatformController],
  providers: [StatformService, ApiKeyGuard, JwtAuthGuard, CbrService],
})
export class StatformModule {}
