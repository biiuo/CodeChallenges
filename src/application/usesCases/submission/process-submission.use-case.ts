import { Injectable, Logger } from '@nestjs/common';
import { RunnerService, ProgrammingLanguage, TestCaseResult } from 'src/infrastructure/runners/runner.service';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';

export interface ProcessSubmissionDTO {
  submissionId: string;
  code: string;
  language: string;
  testCases: Array<{
    id: number;
    input: string;
    output: string;
  }>;
  timeLimit: number;
}

export interface SubmissionResult {
  submissionId: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'ERROR';
  score: number;
  totalTimeMs: number;
  cases: TestCaseResult[];
}

@Injectable()
export class ProcessSubmissionUseCase {
  private readonly logger = new Logger(ProcessSubmissionUseCase.name);

  constructor(
    private readonly runner: RunnerService,
    private readonly observability: ObservabilityService,
  ) {}

  async execute(dto: ProcessSubmissionDTO): Promise<SubmissionResult> {
    const startTime = Date.now();
    const { submissionId, code, language, testCases, timeLimit } = dto;

    this.logger.debug(`[${submissionId}] Starting submission processing for ${language}`);

    this.observability.logSubmissionEvent({
      submissionId,
      event: 'started',
      timestamp: new Date().toISOString(),
      language,
      runnerImage: this.getRunnerImage(language),
    });

    this.observability.incrementActiveRunners();

    try {
      // Validate language
      const programLang = this.mapLanguage(language);
      if (!programLang) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Execute code against all test cases
      const results = await this.runner.executeAgainstTestCases(
        programLang,
        code,
        testCases,
        timeLimit,
      );

      // Calculate overall status and score
      const { status, score } = this.calculateResult(results);
      const totalTimeMs = results.reduce((sum, r) => sum + r.timeMsElapsed, 0);

      this.observability.recordSubmission(status);
      this.observability.recordExecutionTime(totalTimeMs);

      this.observability.logSubmissionEvent({
        submissionId,
        event: 'finished',
        timestamp: new Date().toISOString(),
        status,
        durationMs: Date.now() - startTime,
        language,
      });

      return {
        submissionId,
        status,
        score,
        totalTimeMs,
        cases: results,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[${submissionId}] Error: ${errorMsg}`);

      this.observability.recordSubmission('ERROR');

      this.observability.logSubmissionEvent({
        submissionId,
        event: 'error',
        timestamp: new Date().toISOString(),
        errorMessage: errorMsg,
        language,
      });

      return {
        submissionId,
        status: 'ERROR',
        score: 0,
        totalTimeMs: Date.now() - startTime,
        cases: [],
      };
    } finally {
      this.observability.decrementActiveRunners();
    }
  }

  /**
   * Calculate final status and score based on test case results.
   */
  private calculateResult(
    results: TestCaseResult[],
  ): {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'ERROR';
    score: number;
  } {
    if (results.length === 0) {
      return { status: 'ERROR', score: 0 };
    }

    // Check for compilation errors first
    if (results.some((r) => r.status === 'CE')) {
      return { status: 'COMPILATION_ERROR', score: 0 };
    }

    // Check for runtime errors
    if (results.some((r) => r.status === 'RE')) {
      return { status: 'RUNTIME_ERROR', score: 0 };
    }

    // Check for time limit exceeded
    if (results.some((r) => r.status === 'TLE')) {
      return { status: 'TIME_LIMIT_EXCEEDED', score: 0 };
    }

    // Check for wrong answers
    if (results.some((r) => r.status === 'WA')) {
      // Partial score: number of correct cases
      const correct = results.filter((r) => r.status === 'OK').length;
      const score = Math.round((correct / results.length) * 100);
      return { status: 'WRONG_ANSWER', score };
    }

    // All cases passed
    return { status: 'ACCEPTED', score: 100 };
  }

  /**
   * Map language string to ProgrammingLanguage enum.
   */
  private mapLanguage(lang: string): ProgrammingLanguage | null {
    const mapping: Record<string, ProgrammingLanguage> = {
      python: ProgrammingLanguage.PYTHON,
      python3: ProgrammingLanguage.PYTHON,
      node: ProgrammingLanguage.NODE,
      nodejs: ProgrammingLanguage.NODE,
      js: ProgrammingLanguage.NODE,
      cpp: ProgrammingLanguage.CPP,
      'c++': ProgrammingLanguage.CPP,
      java: ProgrammingLanguage.JAVA,
    };

    return mapping[lang.toLowerCase()] || null;
  }

  /**
   * Map language to docker image name.
   */
  private getRunnerImage(lang: string): string {
    const imageMapping: Record<string, string> = {
      python: 'runner-python:latest',
      python3: 'runner-python:latest',
      node: 'runner-node:latest',
      nodejs: 'runner-node:latest',
      js: 'runner-node:latest',
      cpp: 'runner-cpp:latest',
      'c++': 'runner-cpp:latest',
      java: 'runner-java:latest',
    };

    return imageMapping[lang.toLowerCase()] || 'unknown';
  }
}
