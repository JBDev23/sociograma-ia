// packages/shared/types.ts (o donde tengas tu archivo en el monorepo)

export type RelationshipType = 'AFFINITY' | 'CONFLICT';
export type ContextType = 'WORK' | 'PLAY';
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'; // <-- NUEVO

export interface Member {
  id: string;
  name: string;
  projectId: string;
  createdAt?: string | Date;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  context: ContextType;
  weight: number; 
  fromId: string;
  toId: string;
  projectId: string;
  formId: string;
}

// <-- NUEVOS MODELOS DE FORMULARIO -->
export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  deadline?: string | Date | null;
  projectId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FormResponse {
  id: string;
  formId: string;
  memberId: string;
  createdAt: string | Date;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  savedDistributions?: any; // Idealmente definir tipo JSON exacto o interface
  activeDistributionId?: string | null;
  classroomLayouts?: any;   // Idealmente definir tipo JSON exacto o interface
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  ownerId: string
}

export interface CreateMemberDto {
  name: string;
}

export interface CreateRelationshipDto {
  fromId: string;
  toId: string;
  type: RelationshipType;
  context: ContextType; // <-- AÑADIDO (Faltaba)
  weight: number;
}

export interface ProjectWithDetails extends Project {
  members: Member[];
  relationships: Relationship[];
  forms?: Form[]; // <-- AÑADIDO
  _count?: {      // <-- AÑADIDO (Para Prisma)
    members: number;
  };
}

export interface SociogramData {
  nodes: Member[];
  edges: Relationship[];
}