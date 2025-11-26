import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { compareOutputs, truncateOutput } from './output-utils';
import { ObservabilityService } from '../observability/observability.service';

const execPromise = promisify(exec);

export type TestCaseStatus = 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';

export interface TestCase {
  id: number;
  caseNumber: number;
  input: string;
  output: string;
}

export interface TestCaseResult {
  caseNumber: number;
  status: TestCaseStatus;
  timeMs: number;
  output: string;
  errorMsg: string | null;
}

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  score: number;
  timeMsTotal: number;
  cases: TestCaseResult[];
}

@Injectable()
export class EnhancedRunnerService {
  private readonly logger = new Logger(EnhancedRunnerService.name);

  constructor(private readonly observability: ObservabilityService) {}

  private readonly RUNNER_IMAGES = {
    python: 'runner-python:latest',
    node: 'runner-node:latest',
    cpp: 'runner-cpp:latest',
    java: 'runner-java:latest',
  };

  private readonly FILE_NAMES = {
    python: 'Main.py',
    node: 'Main.js',
    cpp: 'Main.cpp',
    java: 'Main.java',
  };

  /**
   * Ejecuta un submission completo contra todos los test cases
   */
  async executeSubmission(
    submissionId: number,
    language: string,
    code: string,
    testCases: TestCase[],
    timeLimit: number,
    memoryLimit: number,
  ): Promise<ExecutionResult> {
    const workDir = await this.createWorkDirectory(submissionId);
    
    try {
      this.logger.log(`🚀 [${submissionId}] Starting execution: ${testCases.length} cases, ${language}`);

      // 📊 OBSERVABILITY: Runner started
      this.observability.runnerStarted(submissionId, language, `challenge_${submissionId}`, testCases.length);

      // Escribir código en archivo
      const fileName = this.FILE_NAMES[language];
      if (!fileName) {
        throw new Error(`Unsupported language: ${language}`);
      }

      await fs.writeFile(path.join(workDir, fileName), code, 'utf8');

      // Paso 1: Compilación (si aplica)
      if (language === 'cpp' || language === 'java') {
        // 📊 OBSERVABILITY: Compilation started
        this.observability.compilationStarted(submissionId, language);

        const compilationResult = await this.compile(language, workDir, timeLimit);
        if (!compilationResult.success) {
          this.logger.warn(`[${submissionId}] ❌ Compilation failed`);

          // 📊 OBSERVABILITY: Compilation failed
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
              errorMsg: truncateOutput(compilationResult.stderr),
            }],
          };
        }
        this.logger.log(`[${submissionId}] ✅ Compilation successful`);

        // 📊 OBSERVABILITY: Compilation succeeded
        this.observability.compilationSucceeded(submissionId);
      }

      // Paso 2: Ejecutar cada test case
      const results: TestCaseResult[] = [];
      let totalTimeMs = 0;

      for (const testCase of testCases) {
        this.logger.log(`[${submissionId}] 📝 Running case ${testCase.caseNumber}...`);
        
        const result = await this.executeTestCase(
          language,
          workDir,
          testCase,
          timeLimit,
          memoryLimit,
        );

        results.push(result);
        totalTimeMs += result.timeMs;

        this.logger.log(`[${submissionId}] Case ${testCase.caseNumber}: ${result.status} (${result.timeMs}ms)`);

        // 📊 OBSERVABILITY: Test case executed
        this.observability.testCaseExecuted(
          submissionId,
          testCase.caseNumber,
          result.status,
          result.timeMs,
          result.output,
          testCase.output,
          testCase.input,
          result.errorMsg || undefined,
        );

        // Short-circuit: detener en primer error crítico para ahorrar recursos
        if (result.status === 'TIME_LIMIT_EXCEEDED' || result.status === 'RUNTIME_ERROR') {
          this.logger.warn(`[${submissionId}] ⚠️ Short-circuit: stopping after ${result.status}`);
          break;
        }
      }

      // Paso 3: Determinar status final
      const finalStatus = this.determineFinalStatus(results);
      const score = this.calculateScore(results);

      this.logger.log(`[${submissionId}] ✅ Execution completed: ${finalStatus}, score: ${score}`);

      // 📊 OBSERVABILITY: Runner finished
      this.observability.runnerFinished(submissionId, finalStatus, score, totalTimeMs);

      return {
        status: finalStatus,
        score,
        timeMsTotal: totalTimeMs,
        cases: results,
      };

    } finally {
      // Limpieza: eliminar directorio temporal
      await this.cleanupWorkDirectory(workDir);
    }
  }

  /**
   * Compila el código (C++ o Java)
   */
  private async compile(
    language: string,
    workDir: string,
    timeLimit: number,
  ): Promise<{ success: boolean; stderr: string }> {
    const image = this.RUNNER_IMAGES[language];
    let compileCmd = '';

    if (language === 'cpp') {
      compileCmd = 'g++ Main.cpp -O2 -std=c++17 -o main';
    } else if (language === 'java') {
      compileCmd = 'javac Main.java';
    }

    const dockerCmd = `docker run --rm --network none -v ${workDir}:/work -w /work ${image} sh -c "${compileCmd}"`;

    try {
      const { stdout, stderr } = await execPromise(dockerCmd, {
        timeout: timeLimit * 2, // Dar más tiempo para compilación
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return { success: true, stderr: stderr || '' };
    } catch (error: any) {
      return {
        success: false,
        stderr: error.stderr || error.message || 'Compilation failed',
      };
    }
  }

  /**
   * Ejecuta un test case individual
   */
  private async executeTestCase(
    language: string,
    workDir: string,
    testCase: TestCase,
    timeLimit: number,
    memoryLimit: number,
  ): Promise<TestCaseResult> {
    // Escribir input en archivo
    const inputFile = path.join(workDir, 'input.txt');
    await fs.writeFile(inputFile, testCase.input, 'utf8');

    // Construir comando de ejecución
    const image = this.RUNNER_IMAGES[language];
    let runCmd = '';

    switch (language) {
      case 'python':
        runCmd = 'python3 Main.py < input.txt';
        break;
      case 'node':
        runCmd = 'node Main.js < input.txt';
        break;
      case 'cpp':
        runCmd = './main < input.txt';
        break;
      case 'java':
        runCmd = 'java Main < input.txt';
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    // Timeout en segundos (convertir de ms)
    const timeoutSec = Math.ceil(timeLimit / 1000);

    const dockerCmd = [
      'docker run',
      '--rm',
      '--network none',
      `-v ${workDir}:/work`,
      '-w /work',
      `--cpus=".5"`,
      `-m ${memoryLimit}m`,
      image,
      'sh', '-c',
      `"timeout ${timeoutSec}s ${runCmd}"`
    ].join(' ');

    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execPromise(dockerCmd, {
        timeout: timeLimit + 1000, // Buffer adicional
        maxBuffer: 10 * 1024 * 1024,
      });

      const timeMs = Date.now() - startTime;

      // Comparar outputs
      const status = compareOutputs(stdout, testCase.output);

      return {
        caseNumber: testCase.caseNumber,
        status,
        timeMs,
        output: truncateOutput(stdout),
        errorMsg: stderr ? truncateOutput(stderr) : null,
      };

    } catch (error: any) {
      const timeMs = Date.now() - startTime;

      // Detectar tipo de error
      if (error.killed || error.signal === 'SIGTERM') {
        // Timeout alcanzado
        return {
          caseNumber: testCase.caseNumber,
          status: 'TIME_LIMIT_EXCEEDED',
          timeMs: timeLimit,
          output: truncateOutput(error.stdout || ''),
          errorMsg: 'Time limit exceeded',
        };
      }

      // Runtime error
      return {
        caseNumber: testCase.caseNumber,
        status: 'RUNTIME_ERROR',
        timeMs,
        output: truncateOutput(error.stdout || ''),
        errorMsg: truncateOutput(error.stderr || error.message),
      };
    }
  }

  /**
   * Determina el status final del submission basado en los resultados de los casos
   */
  private determineFinalStatus(results: TestCaseResult[]): ExecutionResult['status'] {
    if (results.length === 0) {
      return 'RUNTIME_ERROR';
    }

    // Prioridad de errores
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

    // Todos los casos pasaron
    return 'ACCEPTED';
  }

  /**
   * Calcula el score del submission
   */
  private calculateScore(results: TestCaseResult[]): number {
    if (results.length === 0) {
      return 0;
    }

    const correctCases = results.filter(r => r.status === 'OK').length;
    const totalCases = results.length;

    // Score proporcional
    return Math.floor((correctCases / totalCases) * 100);
  }

  /**
   * Crea un directorio temporal para la ejecución
   */
  private async createWorkDirectory(submissionId: number): Promise<string> {
    const uniqueId = randomBytes(8).toString('hex');
    const dirName = `subm-${submissionId}-${uniqueId}`;
    const dirPath = path.join('/tmp', dirName);
    
    await fs.mkdir(dirPath, { recursive: true });
    
    return dirPath;
  }

  /**
   * Elimina el directorio temporal
   */
  private async cleanupWorkDirectory(workDir: string): Promise<void> {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to cleanup ${workDir}:`, error);
    }
  }
}
