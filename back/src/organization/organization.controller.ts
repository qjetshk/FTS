import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Throttle } from '@nestjs/throttler';
import type { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CompanyInfoDto } from './dto/company-info.dto';
import { ClassifyDto } from './dto/classify.dto';
import { UpdateDeclarantDto } from './dto/update-declarant.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ApiKeyGuard)
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(dto);
  }

  @Get('get-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getAllOrganizations(@CurrentUser() user: JwtPayload) {
    return this.organizationService.getAllOrganizations(user.id);
  }

  @Get('get-by-id/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getOrganizationById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.organizationService.getOrganizationById(id, user.id);
  }

  @Get('get-first')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getFirstOrganization(@CurrentUser() user: JwtPayload) {
    return this.organizationService.getFirstOrganization(user.id);
  }

  // n8n (нода «Get OrgId» в FTS) — без авторизации, поэтому отдаём только id.
  // Раньше возвращалась вся орга: API-ключ OZON и паспорт декларанта по одному Client ID
  @Get('get')
  @HttpCode(HttpStatus.OK)
  async getOrganization(@Query('id') id: string, @Query('clientId') clientId: string) {
    return this.organizationService.getOrganizationId(id, clientId);
  }


  // каждый вызов — n8n + Dadata + OZON
  @Post('company-info')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async companyInfo(@CurrentUser() user: JwtPayload, @Body() dto: CompanyInfoDto) {
    // userId — только из токена: из тела можно было создать оргу на чужой аккаунт
    return this.organizationService.companyInfo(dto.apiKey, dto.clientId, user.id);
  }

  // шаг 1: проверить пару Client ID + ключ в OZON до создания организации
  @Post('check-api-key')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async checkApiKey(@CurrentUser() user: JwtPayload, @Body() dto: CompanyInfoDto) {
    return this.organizationService.checkApiKey(user.id, dto.clientId, dto.apiKey);
  }

  @Post('classify')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async classify(@CurrentUser() user: JwtPayload, @Body() dto: ClassifyDto) {
    // started: false — по этой орге уже идёт прогон, второй не запускаем
    return this.organizationService.classify(user.id, dto.clientId);
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateOrganization(@CurrentUser() user: JwtPayload, @Body() dto: UpdateOrganizationDto) {
    return this.organizationService.updateOrganization(user.id, dto);
  }

  @Get('declarant/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getDeclarantById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.organizationService.getDeclarantById(id, user.id);
  }

  @Put('declarant/update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateDeclarant(@CurrentUser() user: JwtPayload, @Body() dto: UpdateDeclarantDto) {
    return this.organizationService.updateDeclarant(user.id, dto);
  }

  @Get('validate-api-key')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async validateApiKey(@CurrentUser() user: JwtPayload, @Query('orgId') orgId?: string) {
    return this.organizationService.validateApiKey(user.id, orgId);
  }

  @Post('declarant/document/create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createDocument(@CurrentUser() user: JwtPayload, @Body() dto: CreateDocumentDto) {
    return this.organizationService.createDocument(user.id, dto);
  }
}
