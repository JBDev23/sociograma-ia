import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createMemberDto: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        name: createMemberDto.name,
        projectId,
      },
    });
  }

  async findAll(projectId?: string) {
    if (projectId) {
      return this.prisma.member.findMany({
        where: { projectId },
      });
    }
    return this.prisma.member.findMany();
  }

  async findOne(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        sentRelationships: true,
        receivedRelationships: true,
      },
    });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
    });
  }

  async remove(id: string) {
    return this.prisma.member.delete({
      where: { id },
    });
  }
}
