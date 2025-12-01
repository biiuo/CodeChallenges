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
var ProcessSubmissionUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessSubmissionUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/persistence/prisma.service");
const enhanced_runner_service_1 = require("../../../infrastructure/runners/enhanced-runner.service");
let ProcessSubmissionUseCase = ProcessSubmissionUseCase_1 = class ProcessSubmissionUseCase {
    prisma;
    runner;
    logger = new common_1.Logger(ProcessSubmissionUseCase_1.name);
    constructor(prisma, runner) {
        this.prisma = prisma;
        this.runner = runner;
    }
    async execute(input) {
        const { submissionId } = input;
        this.logger.log(`🔄 [${submissionId}] START processing submission`);
        try {
            const submission = await this.prisma.submission.findUnique({
                where: { id: submissionId },
                include: {
                    challenge: {
                        include: {
                            testcases: {
                                orderBy: { caseNumber: 'asc' },
                            },
                        },
                    },
                },
            });
            if (!submission) {
                throw new Error(`Submission ${submissionId} not found`);
            }
            if (submission.status !== 'QUEUED') {
                this.logger.warn(`[${submissionId}] ⚠️ Submission is not QUEUED (status: ${submission.status})`);
                return {
                    submissionId,
                    status: submission.status,
                    score: submission.score ?? 0,
                    timeMsTotal: submission.timeMsTotal ?? 0,
                    casesProcessed: 0,
                };
            }
            await this.prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'RUNNING' },
            });
            this.logger.log(`[${submissionId}] ✅ Status updated to RUNNING`);
            const challenge = submission.challenge;
            if (!challenge) {
                throw new Error(`Challenge not found for submission ${submissionId}`);
            }
            const testcases = challenge.testcases;
            if (!testcases || testcases.length === 0) {
                throw new Error(`No testcases found for challenge ${challenge.id}`);
            }
            this.logger.log(`[${submissionId}] 📋 Challenge: ${challenge.id}, Testcases: ${testcases.length}`);
            const executionResult = await this.runner.executeSubmission(submissionId, submission.language, submission.code, testcases.map((tc, index) => ({
                id: index + 1,
                caseNumber: tc.caseNumber,
                input: tc.input,
                output: tc.output,
            })), challenge.timeLimit, challenge.memoryLimit);
            this.logger.log(`[${submissionId}] 📊 Execution result: ${executionResult.status}, score: ${executionResult.score}`);
            await this.prisma.submissionTestResult.createMany({
                data: executionResult.cases.map((caseResult) => ({
                    submissionId,
                    caseNumber: caseResult.caseNumber,
                    status: caseResult.status,
                    timeMs: caseResult.timeMs,
                    output: caseResult.output,
                    errorMsg: caseResult.errorMsg,
                })),
            });
            this.logger.log(`[${submissionId}] ✅ Persisted ${executionResult.cases.length} test results`);
            await this.prisma.submission.update({
                where: { id: submissionId },
                data: {
                    status: executionResult.status,
                    score: executionResult.score,
                    timeMsTotal: executionResult.timeMsTotal,
                },
            });
            this.logger.log(`[${submissionId}] ✅ COMPLETED processing: ${executionResult.status}`);
            return {
                submissionId,
                status: executionResult.status,
                score: executionResult.score,
                timeMsTotal: executionResult.timeMsTotal,
                casesProcessed: executionResult.cases.length,
            };
        }
        catch (error) {
            this.logger.error(`[${submissionId}] ❌ Error processing submission:`, error);
            try {
                await this.prisma.submission.update({
                    where: { id: submissionId },
                    data: {
                        status: 'RUNTIME_ERROR',
                        score: 0,
                    },
                });
                await this.prisma.submissionTestResult.create({
                    data: {
                        submissionId,
                        caseNumber: 0,
                        status: 'RUNTIME_ERROR',
                        timeMs: 0,
                        output: '',
                        errorMsg: error instanceof Error ? error.message : String(error),
                    },
                });
            }
            catch (dbError) {
                this.logger.error(`[${submissionId}] Failed to update error state:`, dbError);
            }
            throw error;
        }
    }
};
exports.ProcessSubmissionUseCase = ProcessSubmissionUseCase;
exports.ProcessSubmissionUseCase = ProcessSubmissionUseCase = ProcessSubmissionUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        enhanced_runner_service_1.EnhancedRunnerService])
], ProcessSubmissionUseCase);
//# sourceMappingURL=process-submission.use-case.js.map