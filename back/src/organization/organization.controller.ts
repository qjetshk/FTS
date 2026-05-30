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

  @Get('get-first')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getFirstOrganization(@CurrentUser() user: JwtPayload) {
    return this.organizationService.getFirstOrganization(user.id);
  }

  @Get('get')
  @HttpCode(HttpStatus.OK)
  async getOrganization(@Query('id') id: string, @Query('clientId') clientId: string,) {
    return this.organizationService.getOrganization(id, clientId);
  }


  @Post('company-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async companyInfo(@Body() dto: CompanyInfoDto) {
    return this.organizationService.companyInfo(dto.apiKey, dto.clientId, dto.userId);
  }

  @Post('classify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async classify(@Body() dto: ClassifyDto) {
    this.organizationService.classify(dto.clientId);
    return { message: 'Классификация запущена' };
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateOrganization(@Body() dto: UpdateOrganizationDto) {
    return this.organizationService.updateOrganization(dto);
  }

  @Get('declarant/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getDeclarantById(@Param('id') id: string) {
    return this.organizationService.getDeclarantById(id);
  }

  @Put('declarant/update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateDeclarant(@Body() dto: UpdateDeclarantDto) {
    return this.organizationService.updateDeclarant(dto);
  }

  @Post('declarant/document/create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createDocument(@Body() dto: CreateDocumentDto) {
    return this.organizationService.createDocument(dto);
  }
}
