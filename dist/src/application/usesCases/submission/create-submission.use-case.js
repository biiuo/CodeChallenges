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
var CreateSubmissionUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubmissionUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/persistence/prisma.service");
const submission_queue_service_1 = require("../../../infrastructure/queue/submission-queue.service");
const observability_service_1 = require("../../../infrastructure/observability/observability.service");
const client_1 = require("@prisma/client");
const SUPPORTED_LANGUAGES = ['python', 'node', 'cpp', 'java', 'javascript', 'c++'];
let CreateSubmissionUseCase = CreateSubmissionUseCase_1 = class CreateSubmissionUseCase {
    prisma;
    queue;
    observability;
    logger = new common_1.Logger(CreateSubmissionUseCase_1.name);
    constructor(prisma, queue, observability) {
        this.prisma = prisma;
        this.queue = queue;
        this.observability = observability;
    }
    async execute(input) {
        console.log('🔍 [CreateSubmissionUseCase] CALLED with:', JSON.stringify(input));
        await this.validateInput(input);
        if (input.courseId) {
            const enrolled = await this.prisma.courseStudent.findFirst({
                where: { courseId: input.courseId, userId: input.userId },
                select: { courseId: true },
            });
            if (!enrolled) {
                throw new common_1.BadRequestException(`User ${input.userId} is not enrolled in course ${input.courseId}`);
            }
            const challengeAssignedToCourse = await this.prisma.challenge.findFirst({
                where: { id: input.challengeId, courses: { some: { code: input.courseId } } },
                select: { id: true },
            }).catch(() => null);
            if (!challengeAssignedToCourse) {
                this.logger.warn(`Challenge ${input.challengeId} assignment to course ${input.courseId} not verified (relation table not found)`);
            }
        }
        if (input.evaluationId) {
            const evaluation = await this.prisma.evaluation.findUnique({
                where: { id: input.evaluationId },
                select: { id: true, date: true, maxDuration: true, courseId: true },
            });
            if (!evaluation) {
                throw new common_1.NotFoundException(`Evaluation ${input.evaluationId} not found`);
            }
            const now = new Date();
            const startAt = evaluation.date;
            const endAt = new Date(startAt.getTime() + (evaluation.maxDuration ?? 0) * 60_000);
            if (!(now >= startAt && now <= endAt)) {
                throw new common_1.BadRequestException(`Evaluation ${input.evaluationId} is not active`);
            }
            const included = await this.prisma.evaluationChallenge.findFirst({
                where: { evaluationId: input.evaluationId, challengeId: input.challengeId },
                select: { evaluationId: true },
            });
            if (!included) {
                throw new common_1.BadRequestException(`Challenge ${input.challengeId} not part of evaluation ${input.evaluationId}`);
            }
            if (evaluation.courseId) {
                const belongs = await this.prisma.courseStudent.findFirst({
                    where: { userId: input.userId, courseId: evaluation.courseId },
                    select: { userId: true },
                });
                if (!belongs) {
                    throw new common_1.BadRequestException(`User ${input.userId} is not enrolled in course ${evaluation.courseId} for evaluation ${input.evaluationId}`);
                }
            }
        }
        const submissionNumber = await this.getNextSubmissionNumber(input);
        const submission = await this.prisma.submission.create({
            data: {
                userId: input.userId,
                challengeId: input.challengeId,
                language: this.normalizeLanguage(input.language),
                code: input.code,
                courseId: input.courseId ?? null,
                evaluationId: input.evaluationId ?? null,
                submissionNumber,
                status: client_1.SubmissionStatus.QUEUED,
                score: null,
                timeMsTotal: null,
            },
        });
        this.logger.log(`✅ Submission ${submission.id} created: userId=${input.userId}, challenge=${input.challengeId}, lang=${submission.language}`);
        this.observability.submissionCreated(submission.id, input.userId, input.challengeId, submission.language);
        console.log(`🔍 [CreateSubmissionUseCase] About to enqueue submission ${submission.id}`);
        const enqueued = await this.queue.enqueueSubmission({
            submissionId: submission.id,
            userId: input.userId,
            challengeId: input.challengeId,
            language: submission.language,
            code: input.code,
        });
        console.log(`🔍 [CreateSubmissionUseCase] Enqueue result: ${enqueued}`);
        if (!enqueued) {
            console.error(`❌ [CreateSubmissionUseCase] Failed to enqueue submission ${submission.id}`);
            this.logger.error(`⚠️ Failed to enqueue submission ${submission.id}, but it was created in DB`);
        }
        else {
            console.log(`✅ [CreateSubmissionUseCase] Successfully enqueued submission ${submission.id}`);
            this.observability.submissionEnqueued(submission.id, 'submission.queue');
        }
        return submission;
    }
    async validateInput(input) {
        const challenge = await this.prisma.challenge.findUnique({
            where: { id: input.challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException(`Challenge ${input.challengeId} not found`);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: input.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User ${input.userId} not found`);
        }
        const normalized = this.normalizeLanguage(input.language);
        if (!SUPPORTED_LANGUAGES.includes(normalized)) {
            throw new common_1.BadRequestException(`Language '${input.language}' not supported. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        if (!input.code || input.code.trim().length === 0) {
            throw new common_1.BadRequestException('Code cannot be empty');
        }
    }
    async getNextSubmissionNumber(input) {
        const last = await this.prisma.submission.findFirst({
            where: {
                userId: input.userId,
                challengeId: input.challengeId,
                courseId: input.courseId,
                evaluationId: input.evaluationId,
            },
            orderBy: { submissionNumber: 'desc' },
        });
        return last ? last.submissionNumber + 1 : 1;
    }
    normalizeLanguage(lang) {
        const normalized = lang.toLowerCase().trim();
        const mapping = {
            python: 'python',
            python3: 'python',
            py: 'python',
            node: 'node',
            nodejs: 'node',
            javascript: 'node',
            js: 'node',
            cpp: 'cpp',
            'c++': 'cpp',
            java: 'java',
        };
        return mapping[normalized] || normalized;
    }
};
exports.CreateSubmissionUseCase = CreateSubmissionUseCase;
exports.CreateSubmissionUseCase = CreateSubmissionUseCase = CreateSubmissionUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        submission_queue_service_1.SubmissionQueueService,
        observability_service_1.ObservabilityService])
], CreateSubmissionUseCase);
//# sourceMappingURL=create-submission.use-case.js.map