// dto/create-organization.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

class DeclarantDto {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsOptional()
  surname?: string | null;

  @IsString()
  @IsOptional()
  patronymic?: string | null;
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsNotEmpty()
  api_key!: string;

  @IsString()
  @IsNotEmpty()
  full_org!: string;

  @IsString()
  @IsNotEmpty()
  full_opf!: string;

  @IsString()
  @IsNotEmpty()
  inn!: string;

  @IsString()
  @IsNotEmpty()
  ogrn!: string;

  @IsString()
  @IsOptional()
  kpp?: string | null;

  @IsString()
  @IsNotEmpty()
  okato5!: string;

  @ValidateNested()
  @Type(() => DeclarantDto)
  declarant!: DeclarantDto;

  @IsString()
  @IsNotEmpty()
  full_address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsOptional()
  street?: string | null;

  @IsString()
  @IsOptional()
  house?: string | null;

  @IsString()
  @IsOptional()
  room?: string | null;

  @IsString()
  @IsNotEmpty()
  org_lang!: string;

  @IsString()
  @IsNotEmpty()
  postal_code!: string;
}
