import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsString()
  @IsNotEmpty()
  offerId!: string;

  @IsNumber()
  @IsNotEmpty()
  sku!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  categoryPath!: string;

  @IsString()
  @IsOptional()
  primaryImg?: string | null;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  country?: string | null;

  @IsArray()
  @IsOptional()
  countriesOfOrigin?: string[];

  @IsBoolean()
  @IsNotEmpty()
  countryConflict!: boolean;
}
