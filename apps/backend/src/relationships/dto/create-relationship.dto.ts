import { RelationshipType } from '@prisma/client';
import { ContextType, CreateRelationshipDto as ICreateRelationshipDto } from '@sociograma/shared';

export class CreateRelationshipDto implements ICreateRelationshipDto {
  fromId!: string;
  toId!: string;
  type!: RelationshipType;
  weight!: number;
  context!: ContextType;
  formId!: string
}
