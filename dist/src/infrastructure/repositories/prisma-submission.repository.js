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
exports.PrismaSubmissionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const submission_mapper_1 = require("../mappers/submission.mapper");
const enum_mapper_1 = require("../mappers/enum.mapper");
let PrismaSubmissionRepository = class PrismaSubmissionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const lastSubmission = await this.prisma.submission.findFirst({
            where: {
                userId: data.userId,
                challengeId: data.challengeId,
            },
            orderBy: {
                submissionNumber: 'desc',
            },
        });
        const submissionNumber = lastSubmission ? lastSubmission.submissionNumber + 1 : 1;
        const created = await this.prisma.submission.create({
            data: {
                ...submission_mapper_1.SubmissionMapper.toPrisma(data),
                submissionNumber,
            },
        });
        return submission_mapper_1.SubmissionMapper.toDomain(created);
    }
    async findById(id) {
        const submission = await this.prisma.submission.findUnique({ where: { id } });
        return submission ? submission_mapper_1.SubmissionMapper.toDomain(submission) : null;
    }
    async findByUser(userId) {
        const subs = await this.prisma.submission.findMany({ where: { userId } });
        return subs.map(submission_mapper_1.SubmissionMapper.toDomain);
    }
    async findByChallenge(challengeId) {
        const subs = await this.prisma.submission.findMany({ where: { challengeId } });
        return subs.map(submission_mapper_1.SubmissionMapper.toDomain);
    }
    async findAll() {
        const subs = await this.prisma.submission.findMany();
        return subs.map(submission_mapper_1.SubmissionMapper.toDomain);
    }
    async update(id, data) {
        const updated = await this.prisma.submission.update({
            where: { id },
            data: submission_mapper_1.SubmissionMapper.toPrisma(data),
        });
        return submission_mapper_1.SubmissionMapper.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.submission.delete({ where: { id } });
    }
    async findByStatus(status) {
        const subs = await this.prisma.submission.findMany({
            where: { status: enum_mapper_1.EnumMapper.toPrismaSubmissionStatus(status) },
        });
        return subs.map(submission_mapper_1.SubmissionMapper.toDomain);
    }
    async createTestResult(data) {
        await this.prisma.submissionTestResult.create({
            data: {
                submissionId: data.submissionId,
                caseNumber: data.caseNumber,
                status: data.status,
                timeMs: data.timeMs,
                output: data.output,
                errorMsg: data.errorMsg,
            },
        });
    }
    async getTestResults(submissionId) {
        return this.prisma.submissionTestResult.findMany({
            where: { submissionId },
            orderBy: { caseNumber: 'asc' },
        });
    }
};
exports.PrismaSubmissionRepository = PrismaSubmissionRepository;
exports.PrismaSubmissionRepository = PrismaSubmissionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSubmissionRepository);
//# sourceMappingURL=prisma-submission.repository.js.map