import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DOCUMENT_TYPES } from '../data/document-types.data';


export const DOCUMENT_TYPE_CODES = DOCUMENT_TYPES.map(d => d.code);

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  declarantId!: string;

  @IsString()
  @IsIn(DOCUMENT_TYPE_CODES, {message: 'Такого кода документа не найдено!'})
  typeCode!: string;

  @IsString()
  @IsNotEmpty()
  typeShort!: string;

  @IsString()
  @IsOptional()
  series?: string | null;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsString()
  @IsNotEmpty()
  issuedBy!: string;

  @IsDateString()
  issuedAt!: string;
}