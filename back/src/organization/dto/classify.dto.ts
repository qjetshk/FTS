import { IsNotEmpty, IsString } from 'class-validator';

export class ClassifyDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
