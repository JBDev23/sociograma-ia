// apps/backend/src/forms/dto/submit-form.dto.ts
import { IsString, IsArray, IsNotEmpty, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RelationshipType, RelContext } from '@prisma/client';

class SurveyResponseDto {
  @IsString()
  @IsNotEmpty()
  toId!: string;

  @IsEnum(RelationshipType)
  type!: RelationshipType;

  @IsEnum(RelContext)
  context!: RelContext;

  @IsNumber()
  weight!: number;
}

export class SubmitFormDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsArray()
  @Type(() => SurveyResponseDto)
  responses!: SurveyResponseDto[];
}