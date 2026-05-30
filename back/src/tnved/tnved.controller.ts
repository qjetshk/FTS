import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { TnvedService } from './tnved.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SearchTnvedDto {
  @IsString()
  @IsNotEmpty()
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

@Controller('tnved')
export class TnvedController {
  constructor(private readonly tnvedService: TnvedService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async search(@Query() dto: SearchTnvedDto) {
    return this.tnvedService.search(dto.q, dto.page ?? 1, dto.limit ?? 20);
  }
}
