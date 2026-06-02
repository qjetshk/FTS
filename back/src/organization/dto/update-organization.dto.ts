import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsOptional()
  ozonApiKey?: string | null;

  @IsString()
  @IsOptional()
  fullAddress?: string | null;

  @IsString()
  @IsOptional()
  country?: string | null;

  @IsString()
  @IsOptional()
  region?: string | null;

  @IsString()
  @IsOptional()
  city?: string | null;

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
  @IsOptional()
  postalCode?: string | null;
}
