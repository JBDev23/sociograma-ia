// apps/backend/src/ai/ai.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private prisma: PrismaService) {
    this.groq = new Groq();
  }

  async generateGroups(projectId: string, promptUser: string, numGroups?: number, formId?: string) {
    // 1. Obtener todos los datos del proyecto
    const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
      relationships: {
        where: formId ? { formId } : undefined, 
        include: { from: true, to: true },
      },
      forms: formId ? { where: { id: formId } } : { orderBy: { createdAt: 'desc' }, take: 1 }
    },
  });

    if (!project) throw new InternalServerErrorException('Proyecto no encontrado');

    const selectedFormTitle = project.forms[0]?.title || 'Actual';

    // 2. Formatear los datos para que Llama los entienda fácilmente (Reducir tokens)
    const totalMembers = project.members.length;

    const contextData = {
      encuesta_analizada: selectedFormTitle,
      miembros: project.members.map(m => m.name),
      relaciones: project.relationships.map(r => ({
        de: r.from.name,
        para: r.to.name,
        tipo: r.type,
        contexto: r.context,
        peso: r.weight,
      })),
    };

    let groupsConstraint = `\nRESTRICCIÓN: Crea el número de grupos que consideres óptimo.`;

    if (numGroups) {
      const baseSize = Math.floor(totalMembers / numGroups);
      const remainder = totalMembers % numGroups;

      let sizeExplanation = '';
      if (remainder === 0) {
        sizeExplanation = `Los ${numGroups} grupos deben tener EXACTAMENTE ${baseSize} alumnos cada uno.`;
      } else {
        sizeExplanation = `EXACTAMENTE ${remainder} grupo(s) deben tener ${baseSize + 1} alumnos, y EXACTAMENTE ${numGroups - remainder} grupo(s) deben tener ${baseSize} alumnos.`;
      }

      groupsConstraint = `
      RESTRICCIÓN OBLIGATORIA: Debes crear EXACTAMENTE ${numGroups} grupos.
      TAMAÑOS OBLIGATORIOS: Para que sea equitativo, ${sizeExplanation}
      `;
    }

    const systemPrompt = `
      Eres un psicólogo escolar experto en sociometría.
      Tu tarea es distribuir a una clase en grupos de trabajo basándote en sus relaciones.
      
      REGLAS DE HIERRO ABSOLUTAS: 
      1. La clase tiene EXACTAMENTE ${totalMembers} alumnos. 
      2. TODOS Y CADA UNO de los ${totalMembers} alumnos DEBEN ser asignados a un grupo. Nadie puede quedar fuera.
      3. ${groupsConstraint}

      Reglas de sociometría:
      1. Prioriza las afinidades de TRABAJO (WORK).
      2. Evita juntar a personas con conflictos de TRABAJO (WORK).
      3. Intenta que los conflictos de OCIO (PLAY) no arruinen el grupo.
      
      Datos de la clase:
      ${JSON.stringify(contextData)}
      
      INSTRUCCIONES DE FORMATO ESTRICTAS:
      Responde OBLIGATORIAMENTE con un JSON válido que siga EXACTAMENTE esta estructura:
      {
        "_paso1_inventario": ["Escribe aquí los ${totalMembers} nombres exactos..."],
        "_paso2_razonamiento": "Explica cómo vas a encajar a los alumnos respetando los TAMAÑOS OBLIGATORIOS que te he dado arriba.",
        "suggestedGroups": [
          {
            "groupName": "Nombre descriptivo",
            "members": ["Nombre1", "Nombre2", "..."]
          }
        ],
        "_paso3_verificacion": "Cuenta los alumnos. ¿Suman ${totalMembers}? ¿Cumplen los tamaños obligatorios?",
        "explanation": "Breve justificación final para el profesor."
      }
    `;

    try {
      // 4. Llamada a Groq (Llama 3.3 70B)
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptUser },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Baja temperatura = respuestas más lógicas y menos creativas
        response_format: { type: 'json_object' }, // Forzamos JSON Mode
      });

      // 5. Extraer y devolver el JSON
      const responseContent = chatCompletion.choices[0]?.message?.content;
      return JSON.parse(responseContent || '{}');

    } catch (error) {
      console.error('Error con Groq:', error);
      throw new InternalServerErrorException('Error al generar la agrupación con IA');
    }
  }

  async redistributeInLayout(projectId: string, tablesConfig: { id: string, capacity: number }[], formId?: string) {
    // 1. Obtener todos los datos del proyecto
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
        relationships: {
          where: formId ? { formId } : undefined,
          include: { from: true, to: true },
        },
      },
    });

    if (!project) throw new InternalServerErrorException('Proyecto no encontrado');

    const totalMembers = project.members.length;
    const contextData = {
      miembros: project.members.map(m => m.name),
      relaciones: project.relationships.map(r => ({
        de: r.from.name,
        para: r.to.name,
        tipo: r.type,
        contexto: r.context,
        peso: r.weight,
      })),
    };

    // 2. Formatear la restricción física del Layout
    const totalCapacity = tablesConfig.reduce((acc, t) => acc + t.capacity, 0);
    const layoutConstraint = tablesConfig.map((t, i) => 
      `- MESA ${i + 1} (ID Obligatorio: "${t.id}"): Caben máximo ${t.capacity} alumnos.`
    ).join('\n');

    const systemPrompt = `
      Eres un psicólogo escolar experto en sociometría.
      El profesor ya ha colocado las mesas físicamente en el aula. Tu tarea es decidir en qué mesa se sienta cada alumno.
      
      REGLAS DE HIERRO ABSOLUTAS: 
      1. La clase tiene EXACTAMENTE ${totalMembers} alumnos y las mesas suman una capacidad de ${totalCapacity} sillas.
      2. NINGUNA mesa puede superar su capacidad máxima bajo ningún concepto.
      3. DEBES usar los "IDs Obligatorios" que te proporciono para cada mesa.
      4. Si sobran alumnos porque no hay sillas suficientes para todos, mételos en el array "unassigned".
      
      ESTRUCTURA DEL AULA (LAS MESAS):
      ${layoutConstraint}

      Reglas de sociometría:
      1. Prioriza las afinidades de TRABAJO (WORK).
      2. Evita juntar a personas con conflictos de TRABAJO (WORK).
      3. Intenta que los conflictos de OCIO (PLAY) no arruinen el grupo.
      
      Datos de la clase:
      ${JSON.stringify(contextData)}
      
      INSTRUCCIONES DE FORMATO ESTRICTAS:
      Responde OBLIGATORIAMENTE con un JSON válido que siga EXACTAMENTE esta estructura:
      {
        "_paso1_inventario": ["Escribe aquí los ${totalMembers} nombres exactos..."],
        "_paso2_razonamiento": "Explica tu estrategia. ¿Quién no puede sentarse con quién? ¿Cómo vas a aprovechar las mesas más grandes?",
        "assignments": [
          {
            "tableId": "Pega aquí el ID Obligatorio de la mesa (Ej: table-123)",
            "students": ["Nombre1", "Nombre2", "..."]
          }
        ],
        "unassigned": ["Nombres de los alumnos que no cupieron físicamente en las mesas (si aplica)"],
        "_paso3_verificacion": "Suma los alumnos sentados + los unassigned. ¿Dan ${totalMembers}? ¿Has respetado la capacidad de cada mesa?",
        "explanation": "Breve justificación final para el profesor sobre cómo has resuelto este puzzle."
      }
    `;

    try {
      // 3. Llamada a Groq (Llama 3.3 70B)
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: "Por favor, distribuye a los alumnos en estas mesas específicas." },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Baja temperatura = matemáticas y lógica estrictas
        response_format: { type: 'json_object' }, 
      });

      // 4. Extraer y devolver el JSON
      const responseContent = chatCompletion.choices[0]?.message?.content;
      const parsedData = JSON.parse(responseContent || '{}');
      
      // Devolvemos solo el array de mesas (assignments) para que el Frontend lo consuma fácil
      return parsedData.assignments || [];

    } catch (error) {
      console.error('Error con Groq:', error);
      throw new InternalServerErrorException('Error al generar la redistribución con IA');
    }
  }
}

