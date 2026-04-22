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
  console.log('🌱 Iniciando seeding con Perfiles Psicológicos (Demo Mode)...');

  await prisma.formResponse.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.form.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { id: "user-martinez", email: 'profesor@colegio.com', name: 'Profesor Martínez' },
  });

  // =========================================================
  // 🌟 PROYECTO 1: 4º ESO (Con Alumno Aislado y Rechazado)
  // =========================================================
  const p1 = await prisma.project.create({
    data: {
      id: "project-1",
      title: '4º ESO - Sociograma Final Trimestre',
      description: 'Análisis de cohesión grupal. Red densa de 20 alumnos.',
      ownerId: admin.id,
    },
  });

  const namesP1 = [
    'Hugo', 'Martina', 'Leo', 'Julia', 'Mateo', 
    'Valeria', 'Lucas', 'Alba', 'Daniel', 'Noa', 
    'Alejandro', 'Emma', 'Pablo', 'Carmen', 'Álvaro',
    'Sara', 'Diego', 'Carla', 'Mario', 'Irene'
  ];
  
  const membersP1 = await Promise.all(
    namesP1.map(name => prisma.member.create({ data: { name, projectId: p1.id } }))
  );

  const f1 = await prisma.form.create({
    data: {
      title: 'Test Sociométrico Oficial - 4º ESO',
      status: 'CLOSED',
      projectId: p1.id,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    }
  });

  const aisladoId = membersP1.find(m => m.name === 'Mario')!.id;
  const rechazadoId = membersP1.find(m => m.name === 'Diego')!.id;

  const rels: any[] = [];
  
  for (const member of membersP1) {
    // 1. Pool de alumnos disponibles (excluyendo a uno mismo y a Mario)
    let available = membersP1.filter(m => m.id !== member.id && m.id !== aisladoId);
    available = shuffleArray(available);

    const affinityWork: any[] = [];
    const conflictWork: any[] = [];
    const affinityPlay: any[] = [];
    const conflictPlay: any[] = [];

    // 2. Lógica del rechazado (Diego)
    if (member.id !== rechazadoId && Math.random() > 0.3) {
      // Sacamos a Diego del pool general para que no salga en afinidad por error
      available = available.filter(m => m.id !== rechazadoId);
      const diego = membersP1.find(m => m.id === rechazadoId)!;
      
      // Lo colocamos como primera opción de conflicto
      conflictWork.push(diego);
      conflictPlay.push(diego);
    }

    // 3. Rellenamos los huecos sacando a la gente de la lista (así NUNCA se repiten)
    while (affinityWork.length < 3) affinityWork.push(available.shift()!);
    while (conflictWork.length < 3) conflictWork.push(available.shift()!);
    while (affinityPlay.length < 3) affinityPlay.push(available.shift()!);
    while (conflictPlay.length < 3) conflictPlay.push(available.shift()!);

    const categories = [
      { type: 'AFFINITY', context: 'WORK', list: affinityWork },
      { type: 'CONFLICT', context: 'WORK', list: conflictWork },
      { type: 'AFFINITY', context: 'PLAY', list: affinityPlay },
      { type: 'CONFLICT', context: 'PLAY', list: conflictPlay }
    ];

    for (const cat of categories) {
      cat.list.forEach((target, index) => {
        rels.push({
          projectId: p1.id, formId: f1.id, fromId: member.id, toId: target.id,
          type: cat.type, context: cat.context, weight: 3 - index 
        });
      });
    }
  }
  await prisma.relationship.createMany({ data: rels });

  await prisma.formResponse.createMany({
    data: membersP1.map(m => ({ formId: f1.id, memberId: m.id }))
  });


  // =========================================================
  // ⚡ PROYECTO 2: Primaria 5º (Activo, a la mitad)
  // =========================================================
  const p2 = await prisma.project.create({
    data: { id: "project-2", title: 'Primaria 5º - Grupo A', description: 'Proyecto activo. Mitad de respuestas.', ownerId: admin.id },
  });

  const namesP2 = ['Santi', 'Lucía', 'Marcos', 'Elena', 'Tomás', 'Sofía', 'Bruno', 'Paula', 'David', 'Clara'];
  const membersP2 = await Promise.all(namesP2.map(name => prisma.member.create({ data: { name, projectId: p2.id } })));

  const f2 = await prisma.form.create({
    data: { title: 'Encuesta de Convivencia', status: 'ACTIVE', projectId: p2.id, deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) }
  });

  const respondedMembersP2 = membersP2.slice(0, 5);
  await prisma.formResponse.createMany({
    data: respondedMembersP2.map(m => ({ formId: f2.id, memberId: m.id }))
  });

  const relsP2: any[] = [];
  for (const member of respondedMembersP2) {
    let available = membersP2.filter(m => m.id !== member.id);
    available = shuffleArray(available);
    
    relsP2.push({ projectId: p2.id, formId: f2.id, fromId: member.id, toId: available[0].id, type: 'AFFINITY', context: 'WORK', weight: 3 });
    relsP2.push({ projectId: p2.id, formId: f2.id, fromId: member.id, toId: available[1].id, type: 'CONFLICT', context: 'PLAY', weight: 3 });
  }
  await prisma.relationship.createMany({ data: relsP2 });


  // =========================================================
  // 📝 PROYECTO 3: Bachillerato (Borrador vacío)
  // =========================================================
  const p3 = await prisma.project.create({
    data: { id: "project-3", title: '1º Bachillerato - Ciencias', description: 'Borrador inicial.', ownerId: admin.id },
  });

  await prisma.form.create({ data: { title: 'Dinámicas de grupo - Avanzado', status: 'DRAFT', projectId: p3.id } });

  console.log(`
  🚀 ¡Seeding con arquetipos psicológicos completado sin colisiones!
  ================================================
  👤 Usuario: ${admin.email}
  👻 Alumno Aislado: Mario (0 votos recibidos)
  🎯 Alumno Rechazado: Diego (Alta concentración de conflictos)
  `);
}

main()
  .catch((e) => { console.error('❌ Error fatal:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });