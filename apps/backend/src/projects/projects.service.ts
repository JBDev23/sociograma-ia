import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: createProjectDto.title,
        description: createProjectDto.description,
        ownerId: createProjectDto.ownerId
      },
    });
  }

async saveDistribution(projectId: string, name: string, groups: any[], setActive: boolean) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const distributions = (project.savedDistributions as any[]) || [];
    
    // Creamos la nueva entrada
    const newId = crypto.randomUUID();

    const newEntry = {
      id: newId,
      name: name,
      groups: groups,
      createdAt: new Date().toISOString(),
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        savedDistributions: [...distributions, newEntry],
        // Si el usuario lo marca como activo, actualizamos el puntero
        activeDistributionId: setActive ? newId : project.activeDistributionId,
      },
    });
  }

  async deleteDistribution(projectId: string, distributionId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const distributions = (project.savedDistributions as any[]) || [];
    
    const updatedDistributions = distributions.filter(d => d.id !== distributionId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        savedDistributions: updatedDistributions,
        activeDistributionId: project.activeDistributionId === distributionId 
          ? null 
          : project.activeDistributionId
      },
    });
  }

  async findAll(ownerId?: string) {
    if (ownerId) {
      return this.prisma.project.findMany({
        where: { ownerId },
        include: {
          members: true,
          relationships: true,
        },
      });
    }
    return this.prisma.project.findMany({
      include: {
        members: true,
        forms: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { createdAt: 'desc' }
        },
        relationships: {
          select: {
            id: true,
            fromId: true,
            toId: true,
            type: true,
            context: true,
            weight: true,
            formId: true, // <-- ¡SÚPER IMPORTANTE!
          }
        }
      }
    });
  }

  async getUserProjects(userId: string, search?: string, sort?: string) {
    const whereClause: any = { ownerId: userId };
    
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    let orderByClause: any = { updatedAt: 'desc' };

    if (sort === 'oldest') orderByClause = { updatedAt: 'asc' };
    if (sort === 'az') orderByClause = { title: 'asc' };
    if (sort === 'za') orderByClause = { title: 'desc' };

    return this.prisma.project.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        members: true,
        forms: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { createdAt: 'desc' }
        },
        relationships: {
          select: {
            id: true,
            fromId: true,
            toId: true,
            type: true,
            context: true,
            weight: true,
            formId: true, // <-- ¡SÚPER IMPORTANTE!
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        forms: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { createdAt: 'desc' }
        },
        relationships: {
          select: {
            id: true,
            fromId: true,
            toId: true,
            type: true,
            context: true,
            weight: true,
            formId: true, // <-- ¡SÚPER IMPORTANTE!
          }
        }
      }
    });
  }

  async importMembersBulk(projectId: string, names: string[]) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const membersData = names.map(name => ({
      name,
      projectId
    }));

    const result = await this.prisma.member.createMany({
      data: membersData,
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        members: true,
        relationships: true,
      },
    });
  }


  async upsertLayout(projectId: string, layout: { id?: string; name: string; nodes: any[] }) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    const layouts = (project.classroomLayouts as any[]) || [];
    
    const layoutId = layout.id || `layout-${Date.now()}`;
    
    const nodesToSave = layout.nodes.map(n => ({
      ...n,
      data: { ...n.data, students: Array(n.data.capacity || 0).fill(null) }
    }));

    const existingIndex = layouts.findIndex(l => l.id === layoutId);
    
    if (existingIndex > -1) {
      layouts[existingIndex] = { id: layoutId, name: layout.name, nodes: nodesToSave };
    } else {
      layouts.push({ id: layoutId, name: layout.name, nodes: nodesToSave });
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: { classroomLayouts: layouts }
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
