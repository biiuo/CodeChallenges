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
  caseId: number;
  status: 'OK' | 'WA' | 'TLE' | 'RE' | 'CE';
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  timeMsElapsed: number;
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

  private readonly timeoutMs = 5000; // 5s per case
  private readonly cpuLimit = '0.5';
  private readonly memoryLimit = '512m';

  /**
   * Executes code in an isolated Docker container with strict resource limits.
   * @param language Programming language
   * @param code Source code to execute
   * @param input Standard input
   * @param timeLimit Time limit in milliseconds
   * @returns Execution result
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
      // Create temporary directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Write code file based on language
      const codeFile = this.getCodeFilename(language);
      const codePath = path.join(tempDir, codeFile);
      fs.writeFileSync(codePath, code, 'utf8');

      // Write input file
      const inputPath = path.join(tempDir, 'input.txt');
      fs.writeFileSync(inputPath, input, 'utf8');

      // Build docker run command
      const dockerCmd = this.buildDockerRunCommand(
        language,
        image,
        tempDir,
        codeFile,
        timeLimit,
      );

      this.logger.debug(`[${runId}] Executing: ${dockerCmd.join(' ')}`);

      const startTime = Date.now();
      const result = await this.executeDockerWithTimeout(
        dockerCmd,
        timeLimit,
        runId,
      );
      const timeMsElapsed = Date.now() - startTime;

      return {
        ...result,
        timeMsElapsed,
      };
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
      // Cleanup temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Executes code against multiple test cases and returns detailed results.
   */
  async executeAgainstTestCases(
    language: ProgrammingLanguage,
    code: string,
    testCases: Array<{ id: number; input: string; output: string }>,
    timeLimit: number = 1500,
  ): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    this.logger.log(`🧪 Executing ${testCases.length} test cases for ${language}`);

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      this.logger.log(`\n📋 Test Case ${i + 1}/${testCases.length} (ID: ${testCase.id})`);
      this.logger.log(`   Input: ${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}`);
      this.logger.log(`   Expected: ${testCase.output.substring(0, 50)}${testCase.output.length > 50 ? '...' : ''}`);

      const runResult = await this.executeCode(
        language,
        code,
        testCase.input,
        timeLimit,
      );

      this.logger.log(`   Actual: ${runResult.output.substring(0, 50)}${runResult.output.length > 50 ? '...' : ''}`);
      this.logger.log(`   Time: ${runResult.timeMsElapsed}ms`);
      if (runResult.stderr) {
        this.logger.log(`   Stderr: ${runResult.stderr.substring(0, 100)}`);
      }

      const status = this.compareOutputs(
        runResult,
        testCase.output,
        timeLimit,
      );

      this.logger.log(`   Result: ${status} ${status === 'OK' ? '✅' : '❌'}`);

      results.push({
        caseId: testCase.id,
        status,
        expectedOutput: testCase.output,
        actualOutput: runResult.output,
        stderr: runResult.stderr,
        timeMsElapsed: runResult.timeMsElapsed,
      });
    }

    return results;
  }

  /**
   * Builds the docker run command with security and resource limits.
   */
  private buildDockerRunCommand(
    language: ProgrammingLanguage,
    image: string,
    tempDir: string,
    codeFile: string,
    timeLimit: number,
  ): string[] {
    const executionCmd = this.getExecutionCommand(language, codeFile);

    // Windows path conversion: backslashes to forward slashes for docker
    const dockerPath = tempDir.replace(/\\/g, '/');

    return [
      'run',
      '--rm',
      '--network', 'none',
      '--cpus', this.cpuLimit,
      '--memory', this.memoryLimit,
      '--read-only',
      '--tmpfs', '/tmp:rw,exec,size=128m',
      '-v', `${tempDir}:/submission:ro`,
      '--pids-limit', '10',
      image,
      'sh', '-c', executionCmd,
    ];
  }

  /**
   * Gets the code filename based on language.
   */
  private getCodeFilename(language: ProgrammingLanguage): string {
    switch (language) {
      case ProgrammingLanguage.PYTHON:
        return 'solution.py';
      case ProgrammingLanguage.NODE:
        return 'solution.js';
      case ProgrammingLanguage.CPP:
        return 'solution.cpp';
      case ProgrammingLanguage.JAVA:
        return 'Solution.java';
      default:
        throw new Error(`Unknown language: ${language}`);
    }
  }

  /**
   * Gets the execution command for each language.
   */
  private getExecutionCommand(
    language: ProgrammingLanguage,
    codeFile: string,
  ): string {
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

  /**
   * Executes docker command with timeout and captures output/error.
   */
  private async executeDockerWithTimeout(
    dockerCmd: string[],
    timeLimit: number,
    runId: string,
  ): Promise<RunResult> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.logger.warn(`[${runId}] Timeout after ${timeLimit}ms`);
        resolve({
          output: '',
          stderr: 'Time Limit Exceeded',
          exitCode: 124,
          timeMsElapsed: timeLimit,
          status: 'TLE',
        });
      }, timeLimit + 1000); // Add buffer for docker overhead

      execFile('docker', dockerCmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        clearTimeout(timeout);

        // Normalize outputs
        const output = (stdout || '').trimEnd();
        const stderrOutput = (stderr || '').trimEnd();

        let status: 'OK' | 'TLE' | 'RE' | 'CE' = 'OK';
        let exitCode = 0;

        if (err) {
          exitCode = typeof err.code === 'number' ? err.code : 1;
          
          // Determine error type
          if (stderrOutput.includes('error') || stderrOutput.includes('Error')) {
            // Likely compilation error for C++/Java
            status = 'CE';
          } else if (stderrOutput.includes('Segmentation fault') || 
                     stderrOutput.includes('Exception') ||
                     exitCode === 139) {
            status = 'RE';
          } else {
            status = 'RE';
          }
        }

        resolve({
          output,
          stderr: stderrOutput,
          exitCode,
          timeMsElapsed: 0, // Will be calculated by caller
          status,
        });
      });
    });
  }

  /**
   * Compares expected vs actual output.
   * Returns comparison status with detailed logging.
   */
  private compareOutputs(
    runResult: RunResult,
    expectedOutput: string,
    timeLimit: number,
  ): 'OK' | 'WA' | 'TLE' | 'RE' | 'CE' {
    // Check for errors first
    if (runResult.status === 'TLE') {
      this.logger.debug('   ⏱️  Time Limit Exceeded');
      return 'TLE';
    }
    if (runResult.status === 'RE') {
      this.logger.debug('   💥 Runtime Error');
      return 'RE';
    }
    if (runResult.status === 'CE') {
      this.logger.debug('   🔧 Compilation Error');
      return 'CE';
    }

    if (runResult.timeMsElapsed > timeLimit) {
      this.logger.debug(`   ⏱️  Time Limit Exceeded: ${runResult.timeMsElapsed}ms > ${timeLimit}ms`);
      return 'TLE';
    }

    // Normalize outputs for comparison
    const normalizeOutput = (s: string) =>
      s.trim().split('\n').map((l) => l.trim()).join('\n');

    const actual = normalizeOutput(runResult.output);
    const expected = normalizeOutput(expectedOutput);

    // Detailed comparison logging
    if (actual === expected) {
      this.logger.debug('   ✅ Output matches expected');
      return 'OK';
    } else {
      this.logger.debug('   ❌ Output mismatch');
      this.logger.debug(`      Expected (${expected.length} chars): "${expected}"`);
      this.logger.debug(`      Actual   (${actual.length} chars): "${actual}"`);
      
      // Show character-by-character difference if strings are short
      if (expected.length < 100 && actual.length < 100) {
        const maxLen = Math.max(expected.length, actual.length);
        for (let i = 0; i < maxLen; i++) {
          if (expected[i] !== actual[i]) {
            this.logger.debug(`      First diff at position ${i}: expected '${expected[i] || 'EOF'}' got '${actual[i] || 'EOF'}'`);
            break;
          }
        }
      }
      
      return 'WA';
    }
  }
}
