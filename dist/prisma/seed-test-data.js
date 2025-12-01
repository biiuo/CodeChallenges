"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding test data...');
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
//# sourceMappingURL=seed-test-data.js.map