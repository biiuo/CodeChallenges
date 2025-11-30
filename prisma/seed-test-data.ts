import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // 1. Crear usuario de prueba
  const hashedPassword = await argon2.hash('Test123!');
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: hashedPassword,
      name: 'Test User',
      username: 'testuser',
      role: 'STUDENT',
    },
  });
  console.log(`✅ User created: ${testUser.email}`);

  // 2. Crear challenge Hello World
  const helloWorldChallenge = await prisma.challenge.upsert({
    where: { id: 'CH-NZJQV' },
    update: {},
    create: {
      id: 'CH-NZJQV',
      title: 'Hello World',
      description: 'Print "Hello World" to stdout',
      difficulty: 'EASY',
      tags: ['basics', 'io'],
      timeLimit: 1000,
      memoryLimit: 512,
      status: 'PUBLISHED',
      isPublic: true,
      authorId: testUser.id,
    },
  });
  console.log(`✅ Challenge created: ${helloWorldChallenge.title}`);

  // 3. Crear testcase para Hello World
  await prisma.testcase.upsert({
    where: {
      challengeId_caseNumber: {
        challengeId: 'CH-NZJQV',
        caseNumber: 1,
      },
    },
    update: {},
    create: {
      challengeId: 'CH-NZJQV',
      caseNumber: 1,
      input: '',
      output: 'Hello World',
      visible: true,
    },
  });
  console.log(`✅ Testcase created for Hello World`);

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
