import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @IsString()
  @MinLength(2, { message: 'Имя минимум 2 символа' })
  @MaxLength(50)
  name!: string;

  @IsString()
  @MinLength(8, { message: 'Пароль минимум 8 символов' })
  @MaxLength(64)
  password!: string;
}