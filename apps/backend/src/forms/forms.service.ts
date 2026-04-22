// apps/backend/src/forms/forms.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitFormDto } from './dto/submit-form-dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    return this.prisma.form.create({
      data: {
        title: createFormDto.title,
        projectId: createFormDto.projectId,
        deadline: createFormDto.deadline ? new Date(createFormDto.deadline) : null,
        status: createFormDto.status || 'DRAFT',
      },
    });
  }

  async findAllByProject(projectId: string) {
    const forms = await this.prisma.form.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true } // Cuenta cuántos han contestado
        },
        project: {
          select: { 
            title: true,
            _count: { select: { members: true } } // Cuenta cuántos alumnos hay en total
          }
        }
      }
    });

    return forms.map(form => ({
      id: form.id,
      title: form.title,
      status: form.status,
      projectTitle: form.project.title,
      responsesCount: form._count.responses,
      totalMembers: form.project._count.members,
      createdAt: form.createdAt,
      deadline: form.deadline,
    }));
  }

  async findAllByUser(userId: string, search?: string, sort?: string) {
    const whereClause: any = { project: { ownerId: userId } };
    
    // Si hay búsqueda, buscamos en el título del formulario O en el del proyecto
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { project: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Ordenación dinámica
    let orderByClause: any = { createdAt: 'desc' }; // Por defecto: más recientes
    if (sort === 'oldest') orderByClause = { createdAt: 'asc' };
    if (sort === 'az') orderByClause = { title: 'asc' };
    if (sort === 'za') orderByClause = { title: 'desc' };

    const forms = await this.prisma.form.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        _count: { select: { responses: true } },
        project: {
          select: { id: true, title: true, _count: { select: { members: true } } }
        }
      }
    });

    return forms.map(form => ({
      id: form.id,
      title: form.title,
      status: form.status,
      projectId: form.project.id,
      projectTitle: form.project.title,
      responsesCount: form._count.responses,
      totalMembers: form.project._count.members,
      createdAt: form.createdAt,
      deadline: form.deadline,
    }));
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    return this.prisma.form.update({
      where: { id },
      data: updateData,
    });
  }

  async getPublicForm(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: {
            members: {
              select: { id: true, name: true },
              orderBy: { name: 'asc' }
            }
          }
        }
      }
    });

    if (!form) throw new NotFoundException('Encuesta no encontrada');
    return form;
  }

  // 2. Procesar las respuestas del alumno
  async submitSurvey(formId: string, dto: SubmitFormDto) {
    const { memberId, responses } = dto;

    // Validar que el formulario esté activo
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.status !== 'ACTIVE') {
      throw new BadRequestException('Esta encuesta no acepta más respuestas');
    }

    // Usamos una transacción para guardar todo de forma atómica
    return this.prisma.$transaction(async (tx) => {
      // a. Registrar que este alumno ya ha contestado (evita duplicados)
      const existingResponse = await tx.formResponse.findUnique({
        where: { formId_memberId: { formId, memberId } }
      });

      if (existingResponse) {
        throw new BadRequestException('Ya has enviado tus respuestas para esta encuesta');
      }

      await tx.formResponse.create({
        data: { formId, memberId }
      });

      // b. Crear las relaciones sociométricas en la BD
      // Mapeamos los datos para crear múltiples registros en Relationship
      const relationshipsData = responses.map(rel => ({
        fromId: memberId,
        toId: rel.toId,
        type: rel.type,
        context: rel.context,
        weight: rel.weight,
        projectId: form.projectId,
        formId: formId
      }));

      // Usamos createMany para eficiencia (disponible en PostgreSQL)
      return tx.relationship.createMany({
        data: relationshipsData,
        skipDuplicates: true // Por seguridad si ya existieran relaciones previas
      });
    });
  }

  async getFormResults(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            members: { select: { id: true, name: true }, orderBy: { name: 'asc' } }
          }
        },
        responses: {
          select: {
            memberId: true,
            createdAt: true
          }
        }
      }
    });

    if (!form) throw new NotFoundException('Formulario no encontrado');
    return form;
  }

  async findOne(id: string) {
    return this.prisma.form.findUnique({ where: { id } });
  }

  async remove(id: string) {
    return this.prisma.form.delete({ where: { id } });
  }
}