import { TNVED_STATUS } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
  tnvedUnit?: string;

  @IsEnum(TNVED_STATUS)
  @IsNotEmpty()
  tnvedStatus!: TNVED_STATUS
}
