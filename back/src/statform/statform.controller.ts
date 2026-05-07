import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { StatformService } from './statform.service';
import { CreateStatformDto } from './dto/create-statform.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('statforms')
export class StatformController {
  constructor(private readonly statformService: StatformService) {}

  // Вызывается пользователем вручную (перегенерация)
  @Post('create-user')
  @UseGuards(JwtAuthGuard)
  async createStatformByUser(
    @Body() dto: CreateStatformDto,
    @CurrentUser() user: { id: string },
  ) {
    // organizationId берём из БД по userId — не доверяем тому что в dto
    const org = await this.statformService.getOrgByUserId(user.id);
    return this.statformService.createStatform({ ...dto, organizationId: org.id });
  }

  // Вызывается n8n автоматически
  @Post('create-n8n')
  @UseGuards(ApiKeyGuard)
  async createStatformByN8N(@Body() dto: CreateStatformDto) {
    return this.statformService.createStatform(dto);
  }

  // Список статформ текущего пользователя
  @Get()
  @UseGuards(JwtAuthGuard)
  async getStatforms(@CurrentUser() user: { id: string }) {
    const org = await this.statformService.getOrgByUserId(user.id);
    return this.statformService.getStatforms(org.id);
  }

  // Скачать XML файл
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadStatform(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const org = await this.statformService.getOrgByUserId(user.id);
    const xml = await this.statformService.getStatformXml(id, org.id);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="statform-${id}.xml"`,
    );
    res.send(xml);
  }
}

