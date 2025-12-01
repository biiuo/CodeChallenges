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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EnhancedRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedRunnerService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const output_utils_1 = require("./output-utils");
const observability_service_1 = require("../observability/observability.service");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let EnhancedRunnerService = EnhancedRunnerService_1 = class EnhancedRunnerService {
    observability;
    logger = new common_1.Logger(EnhancedRunnerService_1.name);
    constructor(observability) {
        this.observability = observability;
    }
    RUNNER_IMAGES = {
        python: 'runner-python:latest',
        node: 'runner-node:latest',
        cpp: 'runner-cpp:latest',
        java: 'runner-java:latest',
    };
    FILE_NAMES = {
        python: 'Main.py',
        node: 'Main.js',
        cpp: 'Main.cpp',
        java: 'Main.java',
    };
    async executeSubmission(submissionId, language, code, testCases, timeLimit, memoryLimit) {
        const workDir = await this.createWorkDirectory(submissionId);
        this.logger.log(`🔍 [${submissionId}] Work directory created: ${workDir}`);
        try {
            await this.observability.incrementActiveRunners();
            this.logger.log(`🚀 [${submissionId}] Starting execution: ${testCases.length} cases, ${language}`);
            this.observability.runnerStarted(submissionId, language, `challenge_${submissionId}`, testCases.length);
            const fileName = this.FILE_NAMES[language];
            if (!fileName) {
                throw new Error(`Unsupported language: ${language}`);
            }
            const codeFilePath = path.join(workDir, fileName);
            await fs.writeFile(codeFilePath, code, 'utf8');
            this.logger.log(`🔍 [${submissionId}] Code written to: ${codeFilePath}`);
            if (language === 'cpp' || language === 'java') {
                this.observability.compilationStarted(submissionId, language);
                const compilationResult = await this.compile(language, workDir, timeLimit);
                if (!compilationResult.success) {
                    this.logger.warn(`[${submissionId}] ❌ Compilation failed`);
                    this.observability.compilationFailed(submissionId, compilationResult.stderr || 'Unknown compilation error');
                    return {
                        status: 'COMPILATION_ERROR',
                        score: 0,
                        timeMsTotal: 0,
                        cases: [{
                                caseNumber: 0,
                                status: 'COMPILATION_ERROR',
                                timeMs: 0,
                                output: '',
                                errorMsg: (0, output_utils_1.truncateOutput)(compilationResult.stderr),
                            }],
                    };
                }
                this.logger.log(`[${submissionId}] ✅ Compilation successful`);
                this.observability.compilationSucceeded(submissionId);
            }
            const results = [];
            let totalTimeMs = 0;
            for (const testCase of testCases) {
                this.logger.log(`[${submissionId}] 📝 Running case ${testCase.caseNumber}...`);
                const result = await this.executeTestCase(language, workDir, testCase, timeLimit, memoryLimit);
                results.push(result);
                totalTimeMs += result.timeMs;
                this.logger.log(`[${submissionId}] Case ${testCase.caseNumber}: ${result.status} (${result.timeMs}ms)`);
                this.observability.testCaseExecuted(submissionId, testCase.caseNumber, result.status, result.timeMs, result.output, testCase.output, testCase.input, result.errorMsg || undefined);
                if (result.status === 'TIME_LIMIT_EXCEEDED' || result.status === 'RUNTIME_ERROR') {
                    this.logger.warn(`[${submissionId}] ⚠️ Short-circuit: stopping after ${result.status}`);
                    break;
                }
            }
            const finalStatus = this.determineFinalStatus(results);
            const score = this.calculateScore(results);
            this.logger.log(`[${submissionId}] ✅ Execution completed: ${finalStatus}, score: ${score}`);
            this.observability.runnerFinished(submissionId, finalStatus, score, totalTimeMs);
            return {
                status: finalStatus,
                score,
                timeMsTotal: totalTimeMs,
                cases: results,
            };
        }
        finally {
            await this.observability.decrementActiveRunners();
            await this.forceCleanupContainers(submissionId);
            await this.cleanupWorkDirectory(workDir);
        }
    }
    async forceCleanupContainers(submissionId) {
        try {
            const cleanupCmd = 'docker container prune -f --filter "label=com.docker.compose.project=codechallenges"';
            await execPromise(cleanupCmd, { timeout: 5000 }).catch(() => {
                this.logger.debug(`[${submissionId}] Container cleanup completed or not needed`);
            });
        }
        catch (error) {
            this.logger.debug(`[${submissionId}] Container cleanup skipped: ${error.message}`);
        }
    }
    async compile(language, workDir, timeLimit) {
        const image = this.RUNNER_IMAGES[language];
        let compileCmd = '';
        if (language === 'cpp') {
            compileCmd = 'g++ Main.cpp -O2 -std=c++17 -o main';
        }
        else if (language === 'java') {
            compileCmd = 'javac Main.java';
        }
        const dockerCmd = `docker run --rm --network none -v ${workDir}:/work -w /work ${image} sh -c "${compileCmd}"`;
        try {
            const { stdout, stderr } = await execPromise(dockerCmd, {
                timeout: Math.max(timeLimit * 2, 10000),
                maxBuffer: 10 * 1024 * 1024,
            });
            return { success: true, stderr: stderr || '' };
        }
        catch (error) {
            return {
                success: false,
                stderr: error.stderr || error.message || 'Compilation failed',
            };
        }
    }
    async executeTestCase(language, workDir, testCase, timeLimit, memoryLimit) {
        const image = this.RUNNER_IMAGES[language];
        let runCmd = '';
        switch (language) {
            case 'python':
                runCmd = 'python3 Main.py';
                break;
            case 'node':
                runCmd = 'node Main.js';
                break;
            case 'cpp':
                runCmd = './main';
                break;
            case 'java':
                runCmd = 'java Main';
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        const timeoutSec = Math.ceil(timeLimit / 1000);
        const dockerCmd = [
            'echo',
            `'${testCase.input.replace(/'/g, "'\\''")}'`,
            '|',
            'docker run',
            '-i',
            '--rm',
            '--network none',
            '--read-only',
            '--tmpfs /tmp',
            `-v ${workDir}:/work`,
            '-w /work',
            `--cpus=0.5`,
            `-m ${memoryLimit}m`,
            image,
            'sh', '-c',
            `'timeout ${timeoutSec}s ${runCmd}'`
        ].join(' ');
        const startTime = Date.now();
        try {
            const { stdout, stderr } = await execPromise(dockerCmd, {
                timeout: timeLimit + 1000,
                maxBuffer: 10 * 1024 * 1024,
                shell: '/bin/sh',
            });
            const timeMs = Date.now() - startTime;
            const status = (0, output_utils_1.compareOutputs)(stdout, testCase.output);
            return {
                caseNumber: testCase.caseNumber,
                status,
                timeMs,
                output: (0, output_utils_1.truncateOutput)(stdout),
                errorMsg: stderr ? (0, output_utils_1.truncateOutput)(stderr) : null,
            };
        }
        catch (error) {
            const timeMs = Date.now() - startTime;
            await this.killRunningContainers(image).catch(() => {
            });
            if (error.killed || error.signal === 'SIGTERM') {
                return {
                    caseNumber: testCase.caseNumber,
                    status: 'TIME_LIMIT_EXCEEDED',
                    timeMs: timeLimit,
                    output: (0, output_utils_1.truncateOutput)(error.stdout || ''),
                    errorMsg: 'Time limit exceeded',
                };
            }
            return {
                caseNumber: testCase.caseNumber,
                status: 'RUNTIME_ERROR',
                timeMs,
                output: (0, output_utils_1.truncateOutput)(error.stdout || ''),
                errorMsg: (0, output_utils_1.truncateOutput)(error.stderr || error.message),
            };
        }
    }
    async killRunningContainers(image) {
        try {
            const listCmd = `docker ps -q --filter ancestor=${image}`;
            const { stdout } = await execPromise(listCmd, { timeout: 2000 });
            const containerIds = stdout.trim().split('\n').filter(id => id.length > 0);
            if (containerIds.length > 0) {
                this.logger.warn(`🧹 Killing ${containerIds.length} hanging container(s) for image ${image}`);
                await Promise.all(containerIds.map(id => execPromise(`docker kill ${id}`, { timeout: 2000 })
                    .catch(err => this.logger.debug(`Failed to kill container ${id}: ${err.message}`))));
            }
        }
        catch (error) {
            this.logger.debug(`Container kill cleanup skipped: ${error.message}`);
        }
    }
    determineFinalStatus(results) {
        if (results.length === 0) {
            return 'RUNTIME_ERROR';
        }
        if (results.some(r => r.status === 'COMPILATION_ERROR')) {
            return 'COMPILATION_ERROR';
        }
        if (results.some(r => r.status === 'TIME_LIMIT_EXCEEDED')) {
            return 'TIME_LIMIT_EXCEEDED';
        }
        if (results.some(r => r.status === 'RUNTIME_ERROR')) {
            return 'RUNTIME_ERROR';
        }
        if (results.some(r => r.status === 'WRONG_ANSWER')) {
            return 'WRONG_ANSWER';
        }
        return 'ACCEPTED';
    }
    calculateScore(results) {
        if (results.length === 0) {
            return 0;
        }
        const correctCases = results.filter(r => r.status === 'OK').length;
        const totalCases = results.length;
        return Math.floor((correctCases / totalCases) * 100);
    }
    async createWorkDirectory(submissionId) {
        const uniqueId = (0, crypto_1.randomBytes)(8).toString('hex');
        const dirName = `subm-${submissionId}-${uniqueId}`;
        const tmpBaseDir = process.env.RUNNER_TMP_DIR || '/tmp/codechallenges-runs';
        await fs.mkdir(tmpBaseDir, { recursive: true });
        const dirPath = path.join(tmpBaseDir, dirName);
        await fs.mkdir(dirPath, { recursive: true });
        await fs.chmod(dirPath, 0o777);
        return dirPath;
    }
    async cleanupWorkDirectory(workDir) {
        try {
            await fs.rm(workDir, { recursive: true, force: true });
        }
        catch (error) {
            this.logger.warn(`Failed to cleanup ${workDir}:`, error);
        }
    }
};
exports.EnhancedRunnerService = EnhancedRunnerService;
exports.EnhancedRunnerService = EnhancedRunnerService = EnhancedRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [observability_service_1.ObservabilityService])
], EnhancedRunnerService);
//# sourceMappingURL=enhanced-runner.service.js.map