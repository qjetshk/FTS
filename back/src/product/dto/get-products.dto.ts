import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class GetProductsDto {
  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}