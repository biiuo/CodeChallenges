"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaChallengeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const challenge_mapper_1 = require("../mappers/challenge.mapper");
let PrismaChallengeRepository = class PrismaChallengeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const created = await this.prisma.challenge.create({
            data: {
                id: data.id,
                title: data.title,
                description: data.description,
                difficulty: data.difficulty ?? undefined,
                tags: data.tags ?? [],
                timeLimit: data.timeLimit,
                memoryLimit: data.memoryLimit,
                status: data.status ?? challenge_entity_1.ChallengeStatus.DRAFT,
                isPublic: data.isPublic ?? false,
                authorId: data.authorId,
                testcases: data.testCases ? {
                    create: data.testCases.map(tc => ({
                        caseNumber: tc.caseNumber,
                        input: tc.input,
                        output: tc.output,
                        visible: tc.visible
                    }))
                } : undefined
            },
            include: {
                testcases: true
            }
        });
        return challenge_mapper_1.ChallengeMapper.toDomain(created);
    }
    async findById(id) {
        const found = await this.prisma.challenge.findUnique({
            where: { id },
            include: { testcases: true }
        });
        return found ? challenge_mapper_1.ChallengeMapper.toDomain(found) : null;
    }
    async findByTitle(title) {
        const found = await this.prisma.challenge.findFirst({
            where: { title },
            include: { testcases: true }
        });
        return found ? challenge_mapper_1.ChallengeMapper.toDomain(found) : null;
    }
    async findAll() {
        const list = await this.prisma.challenge.findMany({
            include: { testcases: true }
        });
        return list.map(c => challenge_mapper_1.ChallengeMapper.toDomain(c));
    }
    async findByCourse(courseId) {
        const list = await this.prisma.challenge.findMany({
            where: {
                courses: {
                    some: {
                        id: courseId
                    }
                }
            },
            include: {
                courses: true,
                author: true,
                testcases: true
            }
        });
        return list.map(c => challenge_mapper_1.ChallengeMapper.toDomain(c));
    }
    async findByStatus(status) {
        const list = await this.prisma.challenge.findMany({
            where: { status },
            include: { testcases: true }
        });
        return list.map(c => challenge_mapper_1.ChallengeMapper.toDomain(c));
    }
    async findPublished() {
        const list = await this.prisma.challenge.findMany({
            where: { status: challenge_entity_1.ChallengeStatus.PUBLISHED },
            include: { testcases: true }
        });
        return list.map(c => challenge_mapper_1.ChallengeMapper.toDomain(c));
    }
    async update(id, data) {
        const updated = await this.prisma.challenge.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty ?? undefined,
                tags: data.tags,
                timeLimit: data.timeLimit,
                memoryLimit: data.memoryLimit,
                status: data.status,
                isPublic: data.isPublic,
                authorId: data.authorId,
                solutionCode: data.solutionCode,
                solutionLanguage: data.solutionLanguage,
            },
            include: {
                testcases: true
            }
        });
        return challenge_mapper_1.ChallengeMapper.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.challenge.delete({ where: { id } });
    }
    async addTestCases(challengeId, testcases) {
        if (!testcases || testcases.length === 0)
            return;
        await this.prisma.testcase.createMany({
            data: testcases.map(tc => ({
                challengeId,
                caseNumber: tc.caseNumber,
                input: tc.input,
                output: tc.output,
                visible: tc.visible ?? false,
            })),
            skipDuplicates: true,
        });
    }
};
exports.PrismaChallengeRepository = PrismaChallengeRepository;
exports.PrismaChallengeRepository = PrismaChallengeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaChallengeRepository);
//# sourceMappingURL=prisma-challenge.repository.js.map