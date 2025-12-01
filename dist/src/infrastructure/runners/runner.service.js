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
var RunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerService = exports.ProgrammingLanguage = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
var ProgrammingLanguage;
(function (ProgrammingLanguage) {
    ProgrammingLanguage["PYTHON"] = "python";
    ProgrammingLanguage["NODE"] = "node";
    ProgrammingLanguage["CPP"] = "cpp";
    ProgrammingLanguage["JAVA"] = "java";
})(ProgrammingLanguage || (exports.ProgrammingLanguage = ProgrammingLanguage = {}));
let RunnerService = RunnerService_1 = class RunnerService {
    logger = new common_1.Logger(RunnerService_1.name);
    imageByLang = {
        [ProgrammingLanguage.PYTHON]: 'runner-python:latest',
        [ProgrammingLanguage.NODE]: 'runner-node:latest',
        [ProgrammingLanguage.CPP]: 'runner-cpp:latest',
        [ProgrammingLanguage.JAVA]: 'runner-java:latest',
    };
    timeoutMs = 5000;
    cpuLimit = '0.5';
    memoryLimit = '512m';
    async executeAgainstTestCases(language, code, testCases, timeLimit = 1500) {
        const testResults = [];
        let totalTimeMs = 0;
        this.logger.log(`🧪 Executing ${testCases.length} test cases for ${language}`);
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            this.logger.log(`\n📋 Test Case ${testCase.caseNumber}/${testCases.length}`);
            const runResult = await this.executeCode(language, code, testCase.input, timeLimit);
            const status = this.compareOutputs(runResult, testCase.output, timeLimit);
            const passed = status === 'OK';
            const errorMsg = this.getErrorMessage(status, runResult);
            const testCaseResult = {
                caseNumber: testCase.caseNumber,
                status,
                expectedOutput: testCase.output,
                actualOutput: runResult.output,
                stderr: runResult.stderr,
                timeMs: runResult.timeMsElapsed,
                input: testCase.input,
                passed,
                errorMsg
            };
            testResults.push(testCaseResult);
            totalTimeMs += runResult.timeMsElapsed;
            this.logTestCaseResult(testCaseResult, testCases.length);
        }
        return this.calculateFinalResult(testResults, totalTimeMs);
    }
    logTestCaseResult(result, totalCases) {
        const statusIcons = {
            'OK': '✅',
            'WA': '❌',
            'TLE': '⏱️',
            'RE': '💥',
            'CE': '🔧'
        };
        this.logger.log(`   ${statusIcons[result.status]} Case ${result.caseNumber}/${totalCases}: ${result.status}`);
        this.logger.log(`   ⏱️  Time: ${result.timeMs}ms`);
        if (!result.passed) {
            this.logger.log(`   📝 Input: ${result.input.substring(0, 100)}${result.input.length > 100 ? '...' : ''}`);
            this.logger.log(`   📤 Expected: ${result.expectedOutput.substring(0, 100)}${result.expectedOutput.length > 100 ? '...' : ''}`);
            this.logger.log(`   📥 Actual: ${result.actualOutput.substring(0, 100)}${result.actualOutput.length > 100 ? '...' : ''}`);
            if (result.stderr) {
                this.logger.log(`   🔴 Stderr: ${result.stderr.substring(0, 200)}${result.stderr.length > 200 ? '...' : ''}`);
            }
            if (result.errorMsg) {
                this.logger.log(`   💬 Error: ${result.errorMsg}`);
            }
        }
    }
    calculateFinalResult(testResults, totalTimeMs) {
        const totalCases = testResults.length;
        const passedCases = testResults.filter(r => r.passed).length;
        const failedCases = totalCases - passedCases;
        const score = Math.floor((passedCases / totalCases) * 100);
        const failedCasesDetails = testResults
            .filter(r => !r.passed)
            .map(r => `Case ${r.caseNumber}: ${r.status}${r.errorMsg ? ` - ${r.errorMsg}` : ''}`);
        let status = 'ACCEPTED';
        let message = '🎉 ¡Felicidades! Todos los casos de prueba pasaron.';
        if (testResults.some(r => r.status === 'CE')) {
            status = 'COMPILATION_ERROR';
            message = '❌ Error de compilación. Revisa tu código.';
        }
        else if (testResults.some(r => r.status === 'TLE')) {
            status = 'TIME_LIMIT_EXCEEDED';
            message = '⏱️ Tiempo límite excedido. Optimiza tu algoritmo.';
        }
        else if (testResults.some(r => r.status === 'RE')) {
            status = 'RUNTIME_ERROR';
            message = '💥 Error durante la ejecución. Revisa tu código.';
        }
        else if (testResults.some(r => r.status === 'WA')) {
            status = 'WRONG_ANSWER';
            message = `❌ Respuesta incorrecta en ${failedCases} caso(s) de ${totalCases}.`;
            if (failedCasesDetails.length > 0) {
                message += ` Fallos: ${failedCasesDetails.join(', ')}`;
            }
        }
        return {
            status,
            score,
            timeMsTotal: totalTimeMs,
            totalCases,
            passedCases,
            failedCases,
            testResults,
            message
        };
    }
    getErrorMessage(status, runResult) {
        switch (status) {
            case 'WA':
                return 'La salida no coincide con la esperada';
            case 'TLE':
                return 'Tiempo límite excedido';
            case 'RE':
                return runResult.stderr || 'Error durante la ejecución';
            case 'CE':
                return 'Error de compilación';
            default:
                return '';
        }
    }
    async executeCode(language, code, input, timeLimit = 1500) {
        const runId = (0, uuid_1.v4)();
        const tempDir = path.join('/tmp', `run-${runId}`);
        const image = this.imageByLang[language];
        if (!image) {
            throw new Error(`Unsupported language: ${language}`);
        }
        try {
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const codeFile = this.getCodeFilename(language);
            const codePath = path.join(tempDir, codeFile);
            fs.writeFileSync(codePath, code, 'utf8');
            const inputPath = path.join(tempDir, 'input.txt');
            fs.writeFileSync(inputPath, input, 'utf8');
            const dockerCmd = this.buildDockerRunCommand(language, image, tempDir, codeFile, timeLimit);
            this.logger.debug(`[${runId}] Executing: ${dockerCmd.join(' ')}`);
            const startTime = Date.now();
            const result = await this.executeDockerWithTimeout(dockerCmd, timeLimit, runId);
            const timeMsElapsed = Date.now() - startTime;
            return { ...result, timeMsElapsed };
        }
        catch (error) {
            this.logger.error(`[${runId}] Execution error: ${error.message}`);
            return {
                output: '',
                stderr: error.message,
                exitCode: -1,
                timeMsElapsed: timeLimit,
                status: 'RE',
                error: error.message,
            };
        }
        finally {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            catch (_) { }
        }
    }
    buildDockerRunCommand(language, image, tempDir, codeFile, timeLimit) {
        const executionCmd = this.getExecutionCommand(language, codeFile);
        const dockerPath = tempDir.replace(/\\/g, '/');
        return [
            'run', '--rm', '--network', 'none',
            '--cpus', this.cpuLimit, '--memory', this.memoryLimit,
            '--read-only', '--tmpfs', '/tmp:rw,exec,size=128m',
            '-v', `${tempDir}:/submission:ro`, '--pids-limit', '10',
            image, 'sh', '-c', executionCmd,
        ];
    }
    getCodeFilename(language) {
        switch (language) {
            case ProgrammingLanguage.PYTHON: return 'solution.py';
            case ProgrammingLanguage.NODE: return 'solution.js';
            case ProgrammingLanguage.CPP: return 'solution.cpp';
            case ProgrammingLanguage.JAVA: return 'Solution.java';
            default: throw new Error(`Unknown language: ${language}`);
        }
    }
    getExecutionCommand(language, codeFile) {
        switch (language) {
            case ProgrammingLanguage.PYTHON:
                return 'python /submission/solution.py < /submission/input.txt';
            case ProgrammingLanguage.NODE:
                return 'node /submission/solution.js < /submission/input.txt';
            case ProgrammingLanguage.CPP:
                return 'g++ -O2 -o /tmp/a.out /submission/solution.cpp && /tmp/a.out < /submission/input.txt';
            case ProgrammingLanguage.JAVA:
                return 'javac -d /tmp /submission/Solution.java && java -cp /tmp Solution < /submission/input.txt';
            default:
                throw new Error(`Unknown language: ${language}`);
        }
    }
    async executeDockerWithTimeout(dockerCmd, timeLimit, runId) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.logger.warn(`[${runId}] Timeout after ${timeLimit}ms`);
                resolve({
                    output: '', stderr: 'Time Limit Exceeded', exitCode: 124,
                    timeMsElapsed: timeLimit, status: 'TLE',
                });
            }, timeLimit + 1000);
            (0, child_process_1.execFile)('docker', dockerCmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
                clearTimeout(timeout);
                const output = (stdout || '').trimEnd();
                const stderrOutput = (stderr || '').trimEnd();
                let status = 'OK';
                let exitCode = 0;
                if (err) {
                    exitCode = typeof err.code === 'number' ? err.code : 1;
                    if (stderrOutput.includes('error') || stderrOutput.includes('Error')) {
                        status = 'CE';
                    }
                    else if (stderrOutput.includes('Segmentation fault') || stderrOutput.includes('Exception') || exitCode === 139) {
                        status = 'RE';
                    }
                    else {
                        status = 'RE';
                    }
                }
                resolve({ output, stderr: stderrOutput, exitCode, timeMsElapsed: 0, status });
            });
        });
    }
    compareOutputs(runResult, expectedOutput, timeLimit) {
        if (runResult.status === 'TLE')
            return 'TLE';
        if (runResult.status === 'RE')
            return 'RE';
        if (runResult.status === 'CE')
            return 'CE';
        if (runResult.timeMsElapsed > timeLimit)
            return 'TLE';
        const normalizeOutput = (s) => s.trim().split('\n').map((l) => l.trim()).join('\n');
        const actual = normalizeOutput(runResult.output);
        const expected = normalizeOutput(expectedOutput);
        return actual === expected ? 'OK' : 'WA';
    }
};
exports.RunnerService = RunnerService;
exports.RunnerService = RunnerService = RunnerService_1 = __decorate([
    (0, common_1.Injectable)()
], RunnerService);
//# sourceMappingURL=runner.service.js.map