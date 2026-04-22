import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';

@Injectable()
export class RelationshipsService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createRelationshipDto: CreateRelationshipDto) {
    return this.prisma.relationship.create({
      data: {
        fromId: createRelationshipDto.fromId,
        toId: createRelationshipDto.toId,
        type: createRelationshipDto.type,
        weight: createRelationshipDto.weight,
        projectId,
        formId: createRelationshipDto.formId,
      },
    });
  }

  async findAll(projectId?: string) {
    if (projectId) {
      return this.prisma.relationship.findMany({
        where: { projectId },
        include: {
          from: true,
          to: true,
        },
      });
    }
    return this.prisma.relationship.findMany({
      include: {
        from: true,
        to: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.relationship.findUnique({
      where: { id },
      include: {
        from: true,
        to: true,
        project: true,
      },
    });
  }

  async update(id: string, updateRelationshipDto: UpdateRelationshipDto) {
    return this.prisma.relationship.update({
      where: { id },
      data: updateRelationshipDto,
      include: {
        from: true,
        to: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.relationship.delete({
      where: { id },
    });
  }
}
