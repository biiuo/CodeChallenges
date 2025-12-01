"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../infrastructure/prisma.module");
const create_submission_use_case_1 = require("../../application/usesCases/submission/create-submission.use-case");
const process_submission_use_case_1 = require("../../application/usesCases/submission/process-submission.use-case");
const submission_queue_service_1 = require("../../infrastructure/queue/submission-queue.service");
const enhanced_runner_service_1 = require("../../infrastructure/runners/enhanced-runner.service");
const submission_worker_service_1 = require("../../infrastructure/workers/submission-worker.service");
const observability_service_1 = require("../../infrastructure/observability/observability.service");
const submission_controller_1 = require("../controllers/submission.controller");
const prisma_submission_repository_1 = require("../../infrastructure/repositories/prisma-submission.repository");
const prisma_challenge_repository_1 = require("../../infrastructure/repositories/prisma-challenge.repository");
const isWorkerEnabled = process.env.ENABLE_WORKER === 'true';
console.log(`🔧 ENABLE_WORKER=${process.env.ENABLE_WORKER}, isWorkerEnabled=${isWorkerEnabled}`);
const baseProviders = [
    prisma_submission_repository_1.PrismaSubmissionRepository,
    prisma_challenge_repository_1.PrismaChallengeRepository,
    observability_service_1.ObservabilityService,
    submission_queue_service_1.SubmissionQueueService,
    create_submission_use_case_1.CreateSubmissionUseCase,
    process_submission_use_case_1.ProcessSubmissionUseCase,
    enhanced_runner_service_1.EnhancedRunnerService,
];
const workerProviders = isWorkerEnabled ? [submission_worker_service_1.SubmissionWorkerService] : [];
let SubmissionModule = class SubmissionModule {
};
exports.SubmissionModule = SubmissionModule;
exports.SubmissionModule = SubmissionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [submission_controller_1.SubmissionController],
        providers: [
            ...baseProviders,
            ...workerProviders,
        ],
        exports: [
            create_submission_use_case_1.CreateSubmissionUseCase,
            process_submission_use_case_1.ProcessSubmissionUseCase,
            submission_queue_service_1.SubmissionQueueService,
        ],
    })
], SubmissionModule);
//# sourceMappingURL=submission.module.js.map