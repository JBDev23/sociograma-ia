// apps/backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

async function main() {
  console.log('🌱 Iniciando seeding multitemático...');

  // Limpieza total (Ordenado para respetar llaves foráneas por si acaso)
  await prisma.formResponse.deleteMany();
  await prisma.relationship.deleteMany(); // <-- Ahora las relaciones dependen de Form y Project
  await prisma.form.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 1. Usuario único (Dueño de todo)
  const admin = await prisma.user.create({
    data: { 
      id: "user-martinez",
      email: 'profesor@colegio.com', 
      name: 'Profesor Martínez' 
    },
  });

  // =========================================================
  // PROYECTO 1: 4º ESO - EL COMPLETO (Relaciones + Formulario Finalizado)
  // =========================================================
  const p1 = await prisma.project.create({
    data: {
      id: "project-1",
      title: '4º ESO - Sociograma Anual',
      description: 'Análisis de cohesión grupal al finalizar el primer trimestre. Incluye relaciones cruzadas de trabajo y ocio.',
      ownerId: admin.id,
    },
  });

  const namesP1 = ['Hugo', 'Martina', 'Leo', 'Julia', 'Mateo', 'Valeria', 'Lucas', 'Alba', 'Daniel', 'Noa', 'Alejandro', 'Emma', 'Pablo', 'Carmen', 'Álvaro'];
  const membersP1 = await Promise.all(namesP1.map(name => prisma.member.create({ data: { name, projectId: p1.id } })));

  // 👇 CAMBIO 1: Creamos el Formulario ANTES que las relaciones
  const f1 = await prisma.form.create({
    data: {
      title: 'Test Sociométrico Oficial - 4º ESO',
      status: 'CLOSED',
      projectId: p1.id,
      deadline: new Date()
    }
  });

  // 👇 CAMBIO 2: Generar relaciones densas pasándole el formId
  const rels: any = [];
  for (const member of membersP1) {
    const candidates = shuffleArray(membersP1.filter(m => m.id !== member.id));
    const parts = [
      { list: candidates.slice(0, 2), type: 'AFFINITY', context: 'WORK' },
      { list: candidates.slice(2, 4), type: 'CONFLICT', context: 'WORK' },
      { list: candidates.slice(4, 6), type: 'AFFINITY', context: 'PLAY' }
    ];

    parts.forEach(p => p.list.forEach((target, i) => {
      rels.push({ 
        projectId: p1.id, 
        formId: f1.id, // <-- ENLACE CLAVE AL FORMULARIO
        fromId: member.id, 
        toId: target.id, 
        type: p.type, 
        context: p.context, 
        weight: 3 - i 
      });
    }));
  }
  await prisma.relationship.createMany({ data: rels });

  // Todos respondieron
  await prisma.formResponse.createMany({
    data: membersP1.map(m => ({ formId: f1.id, memberId: m.id }))
  });


  // =========================================================
  // PROYECTO 2: Primaria 5º - EL ACTIVO (A medias)
  // =========================================================
  const p2 = await prisma.project.create({
    data: {
      id: "project-2",
      title: 'Primaria 5º - Grupo A',
      description: 'Proyecto activo. Los alumnos están respondiendo actualmente a la encuesta de convivencia.',
      ownerId: admin.id,
    },
  });

  const namesP2 = ['Santi', 'Lucía', 'Marcos', 'Elena', 'Tomás', 'Sofía', 'Bruno', 'Paula'];
  const membersP2 = await Promise.all(namesP2.map(name => prisma.member.create({ data: { name, projectId: p2.id } })));

  const f2 = await prisma.form.create({
    data: {
      title: 'Encuesta de Convivencia y Juego',
      status: 'ACTIVE',
      projectId: p2.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) // en 3 días
    }
  });

  // Cogemos a los 4 primeros
  const respondedMembersP2 = membersP2.slice(0, 4);

  // 1. Guardamos que han respondido (¡SOLO UNA VEZ!)
  await prisma.formResponse.createMany({
    data: respondedMembersP2.map(m => ({ formId: f2.id, memberId: m.id }))
  });

  // 2. Les generamos sus flechas
  const relsP2: any = [];
  for (const member of respondedMembersP2) {
    const candidates = shuffleArray(membersP2.filter(m => m.id !== member.id));
    
    relsP2.push({ projectId: p2.id, formId: f2.id, fromId: member.id, toId: candidates[0].id, type: 'AFFINITY', context: 'WORK', weight: 3 });
    relsP2.push({ projectId: p2.id, formId: f2.id, fromId: member.id, toId: candidates[1].id, type: 'CONFLICT', context: 'WORK', weight: 3 });
  }
  await prisma.relationship.createMany({ data: relsP2 });


  // =========================================================
  // PROYECTO 3: Bachillerato - EL BORRADOR (Nuevo)
  // =========================================================
  const p3 = await prisma.project.create({
    data: {
      id: "project-3",
      title: '1º Bachillerato - Psicología',
      description: 'Configuración inicial. Aún no se han importado todos los alumnos.',
      ownerId: admin.id,
    },
  });

  await prisma.member.create({ data: { name: 'Alumno de prueba', projectId: p3.id } });

  await prisma.form.create({
    data: {
      title: 'Dinámicas de grupo - Avanzado',
      status: 'DRAFT',
      projectId: p3.id
    }
  });

  console.log(`
    ✅ Seeding completado con éxito:
    - 1 Usuario: ${admin.email}
    - 3 Proyectos con diferentes estados.
    - 3 Formularios (CLOSED, ACTIVE, DRAFT).
    - ${rels.length} Relaciones generadas vinculadas a su respectivo formulario.
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });