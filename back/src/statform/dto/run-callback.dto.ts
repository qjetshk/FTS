import { IsString, IsOptional, Matches } from 'class-validator';

export class RunCallbackDto {
  @IsString()
  organizationId!: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM' })
  period!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
