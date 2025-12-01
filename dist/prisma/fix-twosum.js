"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Fixing Two Sum challenge...');
    const challenge = await prisma.challenge.findFirst({
        where: { title: 'Two Sum' },
    });
    if (!challenge) {
        console.error('❌ Two Sum challenge not found!');
        return;
    }
    console.log(`Found challenge: ${challenge.id}`);
    await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
            description: 'Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target.\n\nInput:\n- Primera línea: los números del array separados por espacio.\n- Segunda línea: el valor target.\n\nOutput:\n- Los dos índices separados por espacio (orden ascendente).',
            status: 'PUBLISHED',
        },
    });
    await prisma.testcase.deleteMany({
        where: { challengeId: challenge.id },
    });
    await prisma.testcase.createMany({
        data: [
            {
                challengeId: challenge.id,
                caseNumber: 1,
                input: '2 7 11 15\n9',
                output: '0 1',
                visible: true,
            },
            {
                challengeId: challenge.id,
                caseNumber: 2,
                input: '3 2 4\n6',
                output: '1 2',
                visible: true,
            },
            {
                challengeId: challenge.id,
                caseNumber: 3,
                input: '3 3\n6',
                output: '0 1',
                visible: false,
            },
        ],
    });
    console.log('✅ Two Sum challenge updated with correct test cases.');
}
main()
    .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=fix-twosum.js.map