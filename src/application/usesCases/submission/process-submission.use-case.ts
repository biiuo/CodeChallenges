import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { EnhancedRunnerService } from '../../../infrastructure/runners/enhanced-runner.service';

export interface ProcessSubmissionInput {
  submissionId: number;
}

export interface ProcessSubmissionOutput {
  submissionId: number;
  status: string;
  score: number;
  timeMsTotal: number;
  casesProcessed: number;
}

/**
 * Use Case: PROCESS SUBMISSION (Worker principal)
 * 
 * Flujo completo:
 * 1. Recuperar submission desde DB (debe estar en QUEUED)
 * 2. Actualizar status a RUNNING
 * 3. Recuperar challenge + testcases
 * 4. Ejecutar código contra test cases usando EnhancedRunnerService
 * 5. Persistir SubmissionTestResult para cada caso
 * 6. Actualizar Submission con status final y score
 */
@Injectable()
export class ProcessSubmissionUseCase {
  private readonly logger = new Logger(ProcessSubmissionUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: EnhancedRunnerService,
  ) {}

  async execute(input: ProcessSubmissionInput): Promise<ProcessSubmissionOutput> {
    const { submissionId } = input;

    this.logger.log(`🔄 [${submissionId}] START processing submission`);

    try {
      // ========== PASO 1: Recuperar submission desde DB ==========
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          challenge: {
            include: {
              testcases: {
                orderBy: { caseNumber: 'asc' },
              },
            },
          },
        },
      });

      if (!submission) {
        throw new Error(`Submission ${submissionId} not found`);
      }

      if (submission.status !== 'QUEUED') {
        this.logger.warn(`[${submissionId}] ⚠️ Submission is not QUEUED (status: ${submission.status})`);
        // Retornar el estado actual sin procesar
        return {
          submissionId,
          status: submission.status,
          score: submission.score ?? 0,
          timeMsTotal: submission.timeMsTotal ?? 0,
          casesProcessed: 0,
        };
      }

      // ========== PASO 2: Actualizar status a RUNNING ==========
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'RUNNING' },
      });

      this.logger.log(`[${submissionId}] ✅ Status updated to RUNNING`);

      // ========== PASO 3: Validar challenge y testcases ==========
      const challenge = submission.challenge;
      if (!challenge) {
        throw new Error(`Challenge not found for submission ${submissionId}`);
      }

      const testcases = challenge.testcases;
      if (!testcases || testcases.length === 0) {
        throw new Error(`No testcases found for challenge ${challenge.id}`);
      }

      this.logger.log(`[${submissionId}] 📋 Challenge: ${challenge.id}, Testcases: ${testcases.length}`);

      // ========== PASO 4: Ejecutar código contra test cases ==========
      const executionResult = await this.runner.executeSubmission(
        submissionId,
        submission.language,
        submission.code,
        testcases.map((tc, index) => ({
          id: index + 1,
          caseNumber: tc.caseNumber,
          input: tc.input,
          output: tc.output,
        })),
        challenge.timeLimit,
        challenge.memoryLimit,
      );

      this.logger.log(`[${submissionId}] 📊 Execution result: ${executionResult.status}, score: ${executionResult.score}`);

      // ========== PASO 5: Persistir SubmissionTestResult para cada caso ==========
      await this.prisma.submissionTestResult.createMany({
        data: executionResult.cases.map(caseResult => ({
          submissionId,
          caseNumber: caseResult.caseNumber,
          status: caseResult.status,
          timeMs: caseResult.timeMs,
          output: caseResult.output,
          errorMsg: caseResult.errorMsg,
        })),
      });

      this.logger.log(`[${submissionId}] ✅ Persisted ${executionResult.cases.length} test results`);

      // ========== PASO 6: Actualizar Submission con status final y score ==========
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: executionResult.status,
          score: executionResult.score,
          timeMsTotal: executionResult.timeMsTotal,
        },
      });

      this.logger.log(`[${submissionId}] ✅ COMPLETED processing: ${executionResult.status}`);

      return {
        submissionId,
        status: executionResult.status,
        score: executionResult.score,
        timeMsTotal: executionResult.timeMsTotal,
        casesProcessed: executionResult.cases.length,
      };

    } catch (error) {
      // Manejo de errores: marcar submission como RUNTIME_ERROR
      this.logger.error(`[${submissionId}] ❌ Error processing submission:`, error);

      try {
        await this.prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'RUNTIME_ERROR',
            score: 0,
            timeMsTotal: 0,
          },
        });

        // Crear un test result con el error
        await this.prisma.submissionTestResult.create({
          data: {
            submissionId,
            caseNumber: 0,
            status: 'RUNTIME_ERROR',
            timeMs: 0,
            output: '',
            errorMsg: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (dbError) {
        this.logger.error(`[${submissionId}] Failed to update error status:`, dbError);
      }

      throw error;
    }
  }
}
