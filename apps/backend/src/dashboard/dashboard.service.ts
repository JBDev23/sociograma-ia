import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getStats(userId: string) {
    // Lanzamos todas las consultas en paralelo para máxima velocidad
    const [totalStudents, totalProjects, totalForms, recentProjectsRaw] = await Promise.all([
      // 1. Total de alumnos únicos de este profesor
      this.prisma.member.count({
        where: { project: { ownerId: userId } },
      }),
      
      // 2. Total de proyectos
      this.prisma.project.count({
        where: { ownerId: userId },
      }),
      
      // 3. Total de formularios/sociogramas creados
      this.prisma.form.count({
        where: { project: { ownerId: userId } },
      }),
      
      // 4. Los 3 proyectos más recientes (ordenados por fecha de actualización)
      this.prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
          _count: {
            select: { members: true },
          },
        },
      }),
    ]);

    // Mapeamos los proyectos para devolver una estructura limpia al frontend
    const recentProjects = recentProjectsRaw.map((project) => ({
      id: project.id,
      title: project.title,
      members: project._count.members,
      updatedAt: project.updatedAt, // Devolvemos la fecha real, el frontend calculará el "hace 2 horas"
    }));

    return {
      stats: {
        students: totalStudents,
        projects: totalProjects,
        forms: totalForms,
      },
      recentProjects,
    };
  }
}
