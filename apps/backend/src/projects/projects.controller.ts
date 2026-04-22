import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, Put } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Post(':projectId/distribution')
  async saveDistribution(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; groups: any[]; setActive?: boolean }
  ) {
    return this.projectsService.saveDistribution(
      projectId, 
      body.name, 
      body.groups, 
      body.setActive ?? true
    );
  }

  @Post(':id/members/bulk')
  async importMembersBulk(
    @Param('id') projectId: string,
    @Body('names') names: string[]
  ) {
    return this.projectsService.importMembersBulk(projectId, names);
  }

  @Put(':projectId/layout')
  async upsertClassroomLayout(
    @Param('projectId') projectId: string,
    @Body() body: { id?: string; name: string; nodes: any[] }
  ) {
    if (!body.name || !body.nodes || !Array.isArray(body.nodes)) {
      throw new HttpException(
        'Datos del plano inválidos. Se requiere un nombre y las mesas.', 
        HttpStatus.BAD_REQUEST
      );
    }

    return this.projectsService.upsertLayout(projectId, body);
  }

  @Get()
  findAll(@Query('ownerId') ownerId?: string) {
    return this.projectsService.findAll(ownerId);
  }

  @Get('user/:userId')
  async getUserProjects(
    @Param('userId') userId: string,
    @Query('q') query?: string,
    @Query('sort') sort?: string,
  ) {
    return this.projectsService.getUserProjects(userId, query, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Delete(':projectId/distribution/:distributionId')
  async deleteDistribution(
    @Param('projectId') projectId: string,
    @Param('distributionId') distributionId: string,
  ) {
    return this.projectsService.deleteDistribution(projectId, distributionId);
  }
}
