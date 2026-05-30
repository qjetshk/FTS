import { Module } from '@nestjs/common';
import { TnvedService } from './tnved.service';
import { TnvedController } from './tnved.controller';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Module({
  controllers: [TnvedController],
  providers: [TnvedService, JwtAuthGuard],
})
export class TnvedModule {}
