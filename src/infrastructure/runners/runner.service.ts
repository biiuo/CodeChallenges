import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum ProgrammingLanguage {
  PYTHON = 'python',
  NODE = 'node',
  CPP = 'cpp',
  JAVA = 'java',
}

export interface RunResult {
  output: string;
  stderr: string;
  exitCode: number;
  timeMsElapsed: number;
  status: 'OK' | 'TLE' | 'RE' | 'CE';
  error?: string;
}

export interface TestCaseResult {
  caseNumber: number;
  status: 'OK' | 'WA' | 'TLE' | 'RE' | 'CE';
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  timeMs: number;
  input: string;
  errorMsg?: string;
  passed: boolean;
}

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  score: number;
  timeMsTotal: number;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  testResults: TestCaseResult[];
  message?: string;
}

@Injectable()
export class RunnerService {
  private readonly logger = new Logger(RunnerService.name);
  private readonly imageByLang = {
    [ProgrammingLanguage.PYTHON]: 'runner-python:latest',
    [ProgrammingLanguage.NODE]: 'runner-node:latest',
    [ProgrammingLanguage.CPP]: 'runner-cpp:latest',
    [ProgrammingLanguage.JAVA]: 'runner-java:latest',
  };

  private readonly timeoutMs = 5000;
  private readonly cpuLimit = '0.5';
  private readonly memoryLimit = '512m';

  /**
   * Executes code against multiple test cases and returns detailed results
   */
  async executeAgainstTestCases(
    language: ProgrammingLanguage,
    code: string,
    testCases: Array<{ caseNumber: number; input: string; output: string }>,
    timeLimit: number = 1500,
  ): Promise<ExecutionResult> {
    const testResults: TestCaseResult[] = [];
    let totalTimeMs = 0;

    this.logger.log(`🧪 Executing ${testCases.length} test cases for ${language}`);

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      this.logger.log(`\n📋 Test Case ${testCase.caseNumber}/${testCases.length}`);

      const runResult = await this.executeCode(
        language,
        code,
        testCase.input,
        timeLimit,
      );

      const status = this.compareOutputs(runResult, testCase.output, timeLimit);
      const passed = status === 'OK';
      const errorMsg = this.getErrorMessage(status, runResult);

      const testCaseResult: TestCaseResult = {
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

  /**
   * Log detailed test case result
   */
  private logTestCaseResult(result: TestCaseResult, totalCases: number): void {
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

  /**
   * Calculate final execution result compatible with Prisma schema
   */
  private calculateFinalResult(testResults: TestCaseResult[], totalTimeMs: number): ExecutionResult {
    const totalCases = testResults.length;
    const passedCases = testResults.filter(r => r.passed).length;
    const failedCases = totalCases - passedCases;
    const score = Math.floor((passedCases / totalCases) * 100);

    // Find failed cases for detailed message
    const failedCasesDetails = testResults
      .filter(r => !r.passed)
      .map(r => `Case ${r.caseNumber}: ${r.status}${r.errorMsg ? ` - ${r.errorMsg}` : ''}`);

    let status: ExecutionResult['status'] = 'ACCEPTED';
    let message = '🎉 ¡Felicidades! Todos los casos de prueba pasaron.';

    if (testResults.some(r => r.status === 'CE')) {
      status = 'COMPILATION_ERROR';
      message = '❌ Error de compilación. Revisa tu código.';
    } else if (testResults.some(r => r.status === 'TLE')) {
      status = 'TIME_LIMIT_EXCEEDED';
      message = '⏱️ Tiempo límite excedido. Optimiza tu algoritmo.';
    } else if (testResults.some(r => r.status === 'RE')) {
      status = 'RUNTIME_ERROR';
      message = '💥 Error durante la ejecución. Revisa tu código.';
    } else if (testResults.some(r => r.status === 'WA')) {
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

  /**
   * Get error message for failed test cases
   */
  private getErrorMessage(status: string, runResult: RunResult): string {
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

  /**
   * Executes code in an isolated Docker container
   */
  async executeCode(
    language: ProgrammingLanguage,
    code: string,
    input: string,
    timeLimit: number = 1500,
  ): Promise<RunResult> {
    const runId = uuidv4();
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
    } catch (error) {
      this.logger.error(`[${runId}] Execution error: ${error.message}`);
      return {
        output: '',
        stderr: error.message,
        exitCode: -1,
        timeMsElapsed: timeLimit,
        status: 'RE',
        error: error.message,
      };
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  }

  /**
   * Builds the docker run command with security and resource limits
   */
  private buildDockerRunCommand(
    language: ProgrammingLanguage,
    image: string,
    tempDir: string,
    codeFile: string,
    timeLimit: number,
  ): string[] {
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

  private getCodeFilename(language: ProgrammingLanguage): string {
    switch (language) {
      case ProgrammingLanguage.PYTHON: return 'solution.py';
      case ProgrammingLanguage.NODE: return 'solution.js';
      case ProgrammingLanguage.CPP: return 'solution.cpp';
      case ProgrammingLanguage.JAVA: return 'Solution.java';
      default: throw new Error(`Unknown language: ${language}`);
    }
  }

  private getExecutionCommand(language: ProgrammingLanguage, codeFile: string): string {
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

  private async executeDockerWithTimeout(
    dockerCmd: string[],
    timeLimit: number,
    runId: string,
  ): Promise<RunResult> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.logger.warn(`[${runId}] Timeout after ${timeLimit}ms`);
        resolve({
          output: '', stderr: 'Time Limit Exceeded', exitCode: 124,
          timeMsElapsed: timeLimit, status: 'TLE',
        });
      }, timeLimit + 1000);

      execFile('docker', dockerCmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        clearTimeout(timeout);
        const output = (stdout || '').trimEnd();
        const stderrOutput = (stderr || '').trimEnd();

        let status: 'OK' | 'TLE' | 'RE' | 'CE' = 'OK';
        let exitCode = 0;

        if (err) {
          exitCode = typeof err.code === 'number' ? err.code : 1;
          if (stderrOutput.includes('error') || stderrOutput.includes('Error')) {
            status = 'CE';
          } else if (stderrOutput.includes('Segmentation fault') || stderrOutput.includes('Exception') || exitCode === 139) {
            status = 'RE';
          } else {
            status = 'RE';
          }
        }

        resolve({ output, stderr: stderrOutput, exitCode, timeMsElapsed: 0, status });
      });
    });
  }

  private compareOutputs(
    runResult: RunResult,
    expectedOutput: string,
    timeLimit: number,
  ): 'OK' | 'WA' | 'TLE' | 'RE' | 'CE' {
    if (runResult.status === 'TLE') return 'TLE';
    if (runResult.status === 'RE') return 'RE';
    if (runResult.status === 'CE') return 'CE';
    if (runResult.timeMsElapsed > timeLimit) return 'TLE';

    const normalizeOutput = (s: string) => s.trim().split('\n').map((l) => l.trim()).join('\n');
    const actual = normalizeOutput(runResult.output);
    const expected = normalizeOutput(expectedOutput);

    return actual === expected ? 'OK' : 'WA';
  }
}