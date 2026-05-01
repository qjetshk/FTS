import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, ApiKeyGuard],
})
export class OrganizationModule {}
