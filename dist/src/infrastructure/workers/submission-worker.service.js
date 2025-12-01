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
var SubmissionWorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionWorkerService = void 0;
const common_1 = require("@nestjs/common");
const submission_queue_service_1 = require("../queue/submission-queue.service");
const process_submission_use_case_1 = require("../../application/usesCases/submission/process-submission.use-case");
const observability_service_1 = require("../observability/observability.service");
let SubmissionWorkerService = SubmissionWorkerService_1 = class SubmissionWorkerService {
    queue;
    processSubmission;
    observability;
    logger = new common_1.Logger(SubmissionWorkerService_1.name);
    isRunning = false;
    workerPromise = null;
    constructor(queue, processSubmission, observability) {
        this.queue = queue;
        this.processSubmission = processSubmission;
        this.observability = observability;
    }
    async onModuleInit() {
        this.logger.log('🚀 Starting Submission Worker...');
        this.isRunning = true;
        this.workerPromise = this.workerLoop();
        this.startPeriodicCleanup();
    }
    async onModuleDestroy() {
        this.logger.log('🛑 Stopping Submission Worker...');
        this.isRunning = false;
        if (this.workerPromise) {
            await this.workerPromise;
        }
        this.logger.log('✅ Submission Worker stopped');
    }
    async workerLoop() {
        console.log('🔍 [Worker] Loop started, waiting for jobs...');
        while (this.isRunning) {
            try {
                const job = await this.queue.dequeueSubmission(5);
                if (!job) {
                    console.log('🔍 [Worker] No job in queue, waiting...');
                    continue;
                }
                console.log(`🔍 [Worker] Job received: ${JSON.stringify(job)}`);
                this.logger.log(`📥 Dequeued submission: ${job.submissionId}`);
                this.observability.submissionDequeued(job.submissionId);
                await this.processSubmissionWithRetry(job.submissionId);
            }
            catch (error) {
                this.logger.error('❌ Worker loop error:', error);
                await this.sleep(1000);
            }
        }
        this.logger.log('Worker loop finished');
    }
    async processSubmissionWithRetry(submissionId, maxRetries = 3) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const result = await this.processSubmission.execute({ submissionId });
                this.logger.log(`✅ Submission ${submissionId} processed: ${result.status}, score: ${result.score}`);
                await this.observability.recordSubmission(result.status);
                await this.observability.recordExecutionTime(result.timeMsTotal);
                return;
            }
            catch (error) {
                attempt++;
                this.logger.error(`❌ Submission ${submissionId} failed (attempt ${attempt}/${maxRetries}):`, error);
                if (attempt < maxRetries) {
                    const delayMs = Math.pow(2, attempt) * 1000;
                    this.logger.log(`⏳ Retrying in ${delayMs}ms...`);
                    await this.sleep(delayMs);
                }
                else {
                    this.logger.error(`❌ Submission ${submissionId} failed after ${maxRetries} attempts. Giving up.`);
                }
            }
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    startPeriodicCleanup() {
        const cleanupInterval = 5 * 60 * 1000;
        const cleanup = async () => {
            if (!this.isRunning)
                return;
            try {
                this.logger.log('🧹 Running periodic container cleanup...');
                await this.exec('docker container prune -f').catch(() => { });
                const images = ['runner-python:latest', 'runner-node:latest', 'runner-cpp:latest', 'runner-java:latest'];
                for (const image of images) {
                    const { stdout } = await this.exec(`docker ps -q --filter ancestor=${image}`).catch(() => ({ stdout: '' }));
                    const containerIds = stdout.trim().split('\n').filter(id => id.length > 0);
                    if (containerIds.length > 0) {
                        this.logger.warn(`🧹 Found ${containerIds.length} hanging containers for ${image}, killing...`);
                        await Promise.all(containerIds.map(id => this.exec(`docker kill ${id}`).catch(() => { })));
                    }
                }
                this.logger.log('✅ Periodic cleanup completed');
            }
            catch (error) {
                this.logger.error('❌ Periodic cleanup error:', error);
            }
            if (this.isRunning) {
                setTimeout(cleanup, cleanupInterval);
            }
        };
        setTimeout(cleanup, 30000);
    }
    exec(command) {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execPromise = promisify(exec);
        return execPromise(command, { timeout: 5000 });
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            queueSize: 0,
        };
    }
};
exports.SubmissionWorkerService = SubmissionWorkerService;
exports.SubmissionWorkerService = SubmissionWorkerService = SubmissionWorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [submission_queue_service_1.SubmissionQueueService,
        process_submission_use_case_1.ProcessSubmissionUseCase,
        observability_service_1.ObservabilityService])
], SubmissionWorkerService);
//# sourceMappingURL=submission-worker.service.js.map