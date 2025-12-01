"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SubmissionQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionQueueService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let SubmissionQueueService = SubmissionQueueService_1 = class SubmissionQueueService {
    logger = new common_1.Logger(SubmissionQueueService_1.name);
    redis;
    QUEUE_KEY = 'submission.queue';
    async onModuleInit() {
        this.redis = new ioredis_1.Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || 'redispass',
            maxRetriesPerRequest: 3,
        });
        this.redis.on('connect', () => {
            this.logger.log('✅ Connected to Redis for submission queue');
        });
        this.redis.on('error', (err) => {
            this.logger.error('❌ Redis connection error:', err);
        });
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    async enqueueSubmission(job) {
        try {
            const jobData = JSON.stringify(job);
            await this.redis.rpush(this.QUEUE_KEY, jobData);
            this.logger.log(`📤 Submission ${job.submissionId} enqueued (userId: ${job.userId}, challenge: ${job.challengeId}, lang: ${job.language})`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Failed to enqueue submission ${job.submissionId}:`, error);
            return false;
        }
    }
    async dequeueSubmission(timeout = 0) {
        try {
            const result = await this.redis.blpop(this.QUEUE_KEY, timeout);
            if (!result) {
                return null;
            }
            const [, jobData] = result;
            const job = JSON.parse(jobData);
            this.logger.log(`📥 Submission ${job.submissionId} dequeued`);
            return job;
        }
        catch (error) {
            this.logger.error('❌ Failed to dequeue submission:', error);
            return null;
        }
    }
    async getQueueSize() {
        return await this.redis.llen(this.QUEUE_KEY);
    }
};
exports.SubmissionQueueService = SubmissionQueueService;
exports.SubmissionQueueService = SubmissionQueueService = SubmissionQueueService_1 = __decorate([
    (0, common_1.Injectable)()
], SubmissionQueueService);
//# sourceMappingURL=submission-queue.service.js.map