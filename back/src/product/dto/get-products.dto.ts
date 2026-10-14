import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export class GetProductsDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}