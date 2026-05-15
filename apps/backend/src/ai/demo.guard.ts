// apps/backend/src/ai/demo.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DemoSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Buscamos nuestra cabecera inventada
    const clientSecret = request.headers['x-demo-secret'];
    
    // Lo comparamos con la variable de entorno de tu servidor
    const serverSecret = process.env.DEMO_SECRET;

    if (clientSecret !== serverSecret) {
      console.warn('⚠️ Intento de acceso bloqueado a la IA desde:', request.ip);
      throw new UnauthorizedException('Acceso denegado al endpoint de IA.');
    }

    return true;
  }
}