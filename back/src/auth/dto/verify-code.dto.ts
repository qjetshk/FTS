import { Transform } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';

export class VerifyCodeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @Matches(/^\d{6}$/, { message: 'Код — 6 цифр' })
  code!: string;
}
