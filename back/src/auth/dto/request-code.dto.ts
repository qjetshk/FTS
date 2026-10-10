import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class RequestCodeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;
}
