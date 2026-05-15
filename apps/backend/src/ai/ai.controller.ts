// apps/backend/src/ai/ai.controller.ts
import { Controller, Post, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { DemoSecretGuard } from './demo.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('ai')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(DemoSecretGuard)
  @Post('project/:id/group')
  async groupProject(
    @Param('id') projectId: string,
    @Body('prompt') prompt: string,
    @Body('numGroups') numGroups?: number,
    @Body('formId') formId?: string,
  ) {
    return this.aiService.generateGroups(projectId, prompt, numGroups, formId); 
  }

  @UseGuards(DemoSecretGuard)
  @Post('project/:id/redistribute')
  async redistributeProject(
    @Param('id') projectId: string,
    @Body('tablesConfig') tablesConfig: { id: string; capacity: number }[],
    @Body('formId') formId?: string,
  ) {
    if (!tablesConfig || !Array.isArray(tablesConfig)) {
      throw new HttpException('El formato de las mesas no es válido', HttpStatus.BAD_REQUEST);
    }

    return this.aiService.redistributeInLayout(projectId, tablesConfig, formId);
  }
}