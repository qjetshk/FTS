import { TNVED_STATUS } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class TnvedAlternativeDto {
  @IsString()
  @IsNotEmpty()
  tnvedCode!: string;

  @IsString()
  @IsOptional()
  tnvedName?: string;

  @IsString()
  @IsOptional()
  tnvedUnit?: string | null;
}

export class UpdateTnvedDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @IsString()
  @IsNotEmpty()
  tnvedCode!: string;

  @IsString()
  @IsOptional()
  tnvedName?: string;

  @IsString()
  @IsOptional()
  tnvedUnit?: string | null;

  @IsEnum(TNVED_STATUS)
  @IsNotEmpty()
  tnvedStatus!: TNVED_STATUS;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TnvedAlternativeDto)
  tnvedAlternatives?: TnvedAlternativeDto[];
}
