import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { MembersModule } from './members/members.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FormsModule } from './forms/forms.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PrismaModule, ProjectsModule, MembersModule, RelationshipsModule, AiModule, DashboardModule, FormsModule, AdminModule],
  controllers: [AppController],
})
export class AppModule {}
