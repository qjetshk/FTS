import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Module({
  imports: [JwtModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, ApiKeyGuard, JwtAuthGuard],
})
export class OrganizationModule {}
