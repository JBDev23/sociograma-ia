import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { FormStatus } from '@prisma/client'; // Importamos el enum de Prisma

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(FormStatus)
  status?: FormStatus;
}