import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCountryDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @IsString()
  @IsNotEmpty()
  country!: string;
}
