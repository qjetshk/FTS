import { IsNotEmpty, IsString } from 'class-validator';

export class CompanyInfoDto {
  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
