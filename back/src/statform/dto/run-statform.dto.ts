import { IsOptional, IsString, Matches } from 'class-validator';

export class RunStatformDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM' })
  period!: string;

  // выбранная в бредкрамбе организация; без неё — первая организация юзера
  @IsOptional()
  @IsString()
  orgId?: string;
}
