import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export const PRODUCT_VIEWS = ['attention', 'ok'] as const;
export type ProductView = (typeof PRODUCT_VIEWS)[number];

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

  // attention — нужна правка (= isNeedsAttention на фронте), ok — остальные; без view — все
  @IsOptional()
  @IsIn(PRODUCT_VIEWS)
  view?: ProductView;
}