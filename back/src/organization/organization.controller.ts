import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ApiKeyGuard)
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationService.createOrganization(dto);
  }

  @Get('get_first')
  @HttpCode(HttpStatus.OK)
  async getFirstOrganization(@CurrentUser() user: JwtPayload) {
    return this.organizationService.getFirstOrganization(user.id);
  }

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  async getOrganization(@Param('id') id: string) {
    return this.organizationService.getOrganization(id);
  }
}
