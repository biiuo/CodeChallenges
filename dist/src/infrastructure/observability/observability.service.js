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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ObservabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const tokens_1 = require("../../application/tokens");
let ObservabilityService = ObservabilityService_1 = class ObservabilityService {
    redis;
    logger = new common_1.Logger(ObservabilityService_1.name);
    constructor(redis) {
        this.redis = redis;
    }
    KEYS = {
        SUBMISSIONS_TOTAL: 'metrics:submissions_total',
        SUBMISSIONS_ACCEPTED: 'metrics:submissions_accepted',
        SUBMISSIONS_WRONG_ANSWER: 'metrics:submissions_wrong_answer',
        SUBMISSIONS_TIME_LIMIT_EXCEEDED: 'metrics:submissions_time_limit_exceeded',
        SUBMISSIONS_RUNTIME_ERROR: 'metrics:submissions_runtime_error',
        SUBMISSIONS_COMPILATION_ERROR: 'metrics:submissions_compilation_error',
        SUBMISSIONS_FAILED_TOTAL: 'metrics:submissions_failed_total',
        TOTAL_EXECUTION_TIME_MS: 'metrics:total_execution_time_ms',
        EXECUTION_COUNT: 'metrics:execution_count',
        ACTIVE_RUNNERS: 'metrics:active_runners',
    };
    logSubmissionEvent(event) {
        const logEntry = {
            level: event.event === 'error' ? 'error' : 'info',
            timestamp: event.timestamp,
            submissionId: event.submissionId,
            event: event.event,
            language: event.language,
            status: event.status,
            durationMs: event.durationMs,
            caseId: event.caseId,
            runnerImage: event.runnerImage,
            errorMessage: event.errorMessage,
        };
        if (event.event === 'error') {
            this.logger.error(JSON.stringify(logEntry));
        }
        else {
            this.logger.log(JSON.stringify(logEntry));
        }
    }
    async recordSubmission(status) {
        await this.redis.incr(this.KEYS.SUBMISSIONS_TOTAL);
        switch (status) {
            case 'ACCEPTED':
                await this.redis.incr(this.KEYS.SUBMISSIONS_ACCEPTED);
                break;
            case 'WRONG_ANSWER':
                await this.redis.incr(this.KEYS.SUBMISSIONS_WRONG_ANSWER);
                break;
            case 'TIME_LIMIT_EXCEEDED':
                await this.redis.incr(this.KEYS.SUBMISSIONS_TIME_LIMIT_EXCEEDED);
                break;
            case 'RUNTIME_ERROR':
                await this.redis.incr(this.KEYS.SUBMISSIONS_RUNTIME_ERROR);
                break;
            case 'COMPILATION_ERROR':
                await this.redis.incr(this.KEYS.SUBMISSIONS_COMPILATION_ERROR);
                break;
            case 'ERROR':
                await this.redis.incr(this.KEYS.SUBMISSIONS_FAILED_TOTAL);
                break;
        }
    }
    async recordExecutionTime(durationMs) {
        await this.redis.incrby(this.KEYS.TOTAL_EXECUTION_TIME_MS, Math.floor(durationMs));
        await this.redis.incr(this.KEYS.EXECUTION_COUNT);
    }
    async incrementActiveRunners() {
        await this.redis.incr(this.KEYS.ACTIVE_RUNNERS);
    }
    async decrementActiveRunners() {
        const current = await this.redis.get(this.KEYS.ACTIVE_RUNNERS);
        if (current && parseInt(current) > 0) {
            await this.redis.decr(this.KEYS.ACTIVE_RUNNERS);
        }
    }
    async getMetricsPrometheus() {
        const [submissionsTotal, submissionsAccepted, submissionsWrongAnswer, submissionsTimeLimitExceeded, submissionsRuntimeError, submissionsCompilationError, submissionsFailedTotal, totalExecutionTimeMs, executionCount, activeRunners,] = await Promise.all([
            this.redis.get(this.KEYS.SUBMISSIONS_TOTAL).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_ACCEPTED).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_WRONG_ANSWER).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_TIME_LIMIT_EXCEEDED).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_RUNTIME_ERROR).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_COMPILATION_ERROR).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_FAILED_TOTAL).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.TOTAL_EXECUTION_TIME_MS).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.EXECUTION_COUNT).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.ACTIVE_RUNNERS).then(v => parseInt(v || '0')),
        ]);
        const avgTime = executionCount > 0 ? (totalExecutionTimeMs / executionCount).toFixed(2) : 0;
        return `# HELP submissions_total Total number of submissions processed
# TYPE submissions_total counter
submissions_total ${submissionsTotal}

# HELP submissions_accepted Total accepted submissions
# TYPE submissions_accepted counter
submissions_accepted ${submissionsAccepted}

# HELP submissions_wrong_answer Total wrong answer submissions
# TYPE submissions_wrong_answer counter
submissions_wrong_answer ${submissionsWrongAnswer}

# HELP submissions_time_limit_exceeded Total time limit exceeded submissions
# TYPE submissions_time_limit_exceeded counter
submissions_time_limit_exceeded ${submissionsTimeLimitExceeded}

# HELP submissions_runtime_error Total runtime error submissions
# TYPE submissions_runtime_error counter
submissions_runtime_error ${submissionsRuntimeError}

# HELP submissions_compilation_error Total compilation error submissions
# TYPE submissions_compilation_error counter
submissions_compilation_error ${submissionsCompilationError}

# HELP submissions_failed_total Total failed submissions (internal errors)
# TYPE submissions_failed_total counter
submissions_failed_total ${submissionsFailedTotal}

# HELP average_execution_time_ms Average execution time in milliseconds
# TYPE average_execution_time_ms gauge
average_execution_time_ms ${avgTime}

# HELP active_runners Current number of active runner containers
# TYPE active_runners gauge
active_runners ${activeRunners}
`;
    }
    async getMetricsJson() {
        const [submissionsTotal, submissionsAccepted, submissionsWrongAnswer, submissionsTimeLimitExceeded, submissionsRuntimeError, submissionsCompilationError, submissionsFailedTotal, totalExecutionTimeMs, executionCount, activeRunners,] = await Promise.all([
            this.redis.get(this.KEYS.SUBMISSIONS_TOTAL).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_ACCEPTED).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_WRONG_ANSWER).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_TIME_LIMIT_EXCEEDED).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_RUNTIME_ERROR).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_COMPILATION_ERROR).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.SUBMISSIONS_FAILED_TOTAL).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.TOTAL_EXECUTION_TIME_MS).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.EXECUTION_COUNT).then(v => parseInt(v || '0')),
            this.redis.get(this.KEYS.ACTIVE_RUNNERS).then(v => parseInt(v || '0')),
        ]);
        const avgTime = executionCount > 0 ? totalExecutionTimeMs / executionCount : 0;
        return {
            submissions_total: submissionsTotal,
            submissions_accepted: submissionsAccepted,
            submissions_wrong_answer: submissionsWrongAnswer,
            submissions_time_limit_exceeded: submissionsTimeLimitExceeded,
            submissions_runtime_error: submissionsRuntimeError,
            submissions_compilation_error: submissionsCompilationError,
            submissions_failed_total: submissionsFailedTotal,
            average_execution_time_ms: avgTime,
            active_runners: activeRunners,
        };
    }
    submissionCreated(submissionId, userId, challengeId, language) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'submission_created',
            timestamp: new Date().toISOString(),
            submissionId,
            userId,
            challengeId,
            language,
        }));
    }
    submissionEnqueued(submissionId, queueName = 'submission.queue') {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'submission_enqueued',
            timestamp: new Date().toISOString(),
            submissionId,
            queueName,
        }));
    }
    submissionDequeued(submissionId) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'submission_dequeued',
            timestamp: new Date().toISOString(),
            submissionId,
        }));
    }
    runnerStarted(submissionId, language, challengeId, testCasesCount) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'runner_started',
            timestamp: new Date().toISOString(),
            submissionId,
            language,
            challengeId,
            testCasesCount,
        }));
    }
    testCaseExecuted(submissionId, testCase, status, durationMs, output, expected, input, stderr, exitCode) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'testcase_executed',
            timestamp: new Date().toISOString(),
            submissionId,
            testCase,
            status,
            durationMs,
            output: output?.substring(0, 200),
            expected: expected?.substring(0, 200),
            input: input?.substring(0, 100),
            stderr: stderr?.substring(0, 200),
            exitCode,
        }));
    }
    runnerFinished(submissionId, finalStatus, score, totalDurationMs) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'runner_finished',
            timestamp: new Date().toISOString(),
            submissionId,
            finalStatus,
            score,
            totalDurationMs,
        }));
    }
    runnerError(submissionId, error, stderr, exitCode) {
        this.logger.error(JSON.stringify({
            level: 'error',
            event: 'runner_error',
            timestamp: new Date().toISOString(),
            submissionId,
            error,
            stderr: stderr?.substring(0, 500),
            exitCode,
        }));
    }
    compilationStarted(submissionId, language) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'compilation_started',
            timestamp: new Date().toISOString(),
            submissionId,
            language,
        }));
    }
    compilationFailed(submissionId, stderr) {
        this.logger.error(JSON.stringify({
            level: 'error',
            event: 'compilation_failed',
            timestamp: new Date().toISOString(),
            submissionId,
            stderr: stderr?.substring(0, 500),
        }));
    }
    compilationSucceeded(submissionId) {
        this.logger.log(JSON.stringify({
            level: 'info',
            event: 'compilation_succeeded',
            timestamp: new Date().toISOString(),
            submissionId,
        }));
    }
    debugRunner(submissionId, details) {
        this.logger.debug(JSON.stringify({
            level: 'debug',
            event: 'debug_runner',
            timestamp: new Date().toISOString(),
            submissionId,
            ...details,
        }));
    }
};
exports.ObservabilityService = ObservabilityService;
exports.ObservabilityService = ObservabilityService = ObservabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], ObservabilityService);
//# sourceMappingURL=observability.service.js.map