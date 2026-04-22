import { Controller, Post, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DemoSecretGuard } from '../ai/demo.guard';

const execPromise = promisify(exec);

@Controller('admin')
export class AdminController {
  
  @UseGuards(DemoSecretGuard)
  @Post('reset-db')
  async resetDatabase() {
    try {
      const { stdout, stderr } = await execPromise('npx prisma db seed');
      
      return { 
        message: 'Base de datos restaurada con éxito',
        output: stdout 
      };
    } catch (error) {
      console.error('Error al resetear la DB:', error);
      throw new InternalServerErrorException('No se pudo resetear la base de datos');
    }
  }
}