import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeclarantDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsOptional()
  surname?: string | null;

  @IsString()
  @IsOptional()
  patronymic?: string | null;

  @IsString()
  @IsOptional()
  position?: string | null;

  @IsEmail()
  @IsOptional()
  email?: string | null;

  @IsString()
  @IsOptional()
  phone?: string | null;
}
