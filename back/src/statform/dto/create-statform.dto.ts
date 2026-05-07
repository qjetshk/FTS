import { IsString, IsArray, IsNumber, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { N8nOrderItem } from '../statform.builder';

export class CreateStatformDto {
  @IsString()
  period!: string; // 'YYYY-MM'

  @IsString()
  @IsIn(['BY', 'KZ', 'AM', 'KG'])
  country!: string;

  @IsString()
  organizationId!: string;

  @IsArray()
  orders!: N8nOrderItem[];
}