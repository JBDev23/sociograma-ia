// apps/backend/src/forms/forms.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Query, Patch } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { SubmitFormDto } from './dto/submit-form-dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  // GET /forms/project/123-abc
  @Get('project/:projectId')
  findAllByProject(@Param('projectId') projectId: string) {
    return this.formsService.findAllByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Get('user/:userId')
  findAllByUser(
    @Param('userId') userId: string,
    @Query('q') query?: string,
    @Query('sort') sort?: string,
  ) {
    return this.formsService.findAllByUser(userId, query, sort);
  }

  @Get(':id/public')
  getPublicForm(@Param('id') id: string) {
    return this.formsService.getPublicForm(id);
  }

  @Get(':id/results')
  getFormResults(@Param('id') id: string) {
    return this.formsService.getFormResults(id);
  }

  @Post(':id/submit')
  submitSurvey(
    @Param('id') id: string, 
    @Body() submitFormDto: SubmitFormDto
  ) {
    return this.formsService.submitSurvey(id, submitFormDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.formsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}