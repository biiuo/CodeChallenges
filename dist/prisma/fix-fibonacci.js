"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Fixing/Creating Fibonacci challenge...');
    const author = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'PROFESSOR'] } }
    });
    if (!author) {
        console.error('❌ No suitable author found (ADMIN or PROFESSOR).');
        return;
    }
    const title = 'Fibonacci Sequence';
    const description = 'Escribe una función que calcule el n-ésimo número de Fibonacci.\n\nLa sucesión de Fibonacci se define como:\n- F(0) = 0\n- F(1) = 1\n- F(n) = F(n-1) + F(n-2) para n > 1\n\nInput:\n- Un único número entero n (0 <= n <= 30).\n\nOutput:\n- El n-ésimo número de Fibonacci.';
    let challenge = await prisma.challenge.findFirst({
        where: { title: title },
    });
    if (challenge) {
        console.log(`Found existing challenge: ${challenge.id}`);
        challenge = await prisma.challenge.update({
            where: { id: challenge.id },
            data: {
                description,
                status: 'PUBLISHED',
                isPublic: true,
            },
        });
    }
    else {
        console.log('Creating new challenge...');
        challenge = await prisma.challenge.create({
            data: {
                title,
                description,
                difficulty: 'MEDIUM',
                tags: ['dynamic-programming', 'recursion', 'math'],
                timeLimit: 1000,
                memoryLimit: 128,
                status: 'PUBLISHED',
                isPublic: true,
                authorId: author.id,
            },
        });
    }
    await prisma.testcase.deleteMany({
        where: { challengeId: challenge.id },
    });
    await prisma.testcase.createMany({
        data: [
            {
                challengeId: challenge.id,
                caseNumber: 1,
                input: '0',
                output: '0',
                visible: true,
            },
            {
                challengeId: challenge.id,
                caseNumber: 2,
                input: '1',
                output: '1',
                visible: true,
            },
            {
                challengeId: challenge.id,
                caseNumber: 3,
                input: '5',
                output: '5',
                visible: true,
            },
            {
                challengeId: challenge.id,
                caseNumber: 4,
                input: '10',
                output: '55',
                visible: false,
            },
            {
                challengeId: challenge.id,
                caseNumber: 5,
                input: '20',
                output: '6765',
                visible: false,
            },
        ],
    });
    console.log('✅ Fibonacci challenge updated/created with correct test cases.');
}
main()
    .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=fix-fibonacci.js.map