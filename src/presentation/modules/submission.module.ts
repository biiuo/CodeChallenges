import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { CreateSubmissionUseCase } from '../../application/usesCases/submission/create-submission.use-case';
import { ProcessSubmissionUseCase } from '../../application/usesCases/submission/process-submission.use-case';
import { SubmissionQueueService } from '../../infrastructure/queue/submission-queue.service';
import { EnhancedRunnerService } from '../../infrastructure/runners/enhanced-runner.service';
import { SubmissionWorkerService } from '../../infrastructure/workers/submission-worker.service';
import { ObservabilityService } from '../../infrastructure/observability/observability.service';
import { SubmissionController } from '../controllers/submission.controller';
import { PrismaSubmissionRepository } from '../../infrastructure/repositories/prisma-submission.repository';
import { PrismaChallengeRepository } from '../../infrastructure/repositories/prisma-challenge.repository';

/**
 * Módulo de Submissions (Judge System)
 * 
 * Arquitectura:
 * - Controller: Endpoints HTTP (POST /submissions, GET /submissions/:id, etc.)
 * - CreateSubmissionUseCase: Validar, crear en DB (QUEUED), encolar en Redis
 * - SubmissionQueueService: Gestión de cola Redis (RPUSH/BLPOP)
 * - SubmissionWorkerService: Worker background que consume cola
 * - ProcessSubmissionUseCase: Lógica principal de ejecución (RUNNING → final state)
 * - EnhancedRunnerService: Ejecución en Docker con compilation y per-case execution
 * 
 * Flujo completo:
 * 1. POST /submissions → CreateSubmissionUseCase → DB (QUEUED) → Redis queue
 * 2. Worker dequeue → ProcessSubmissionUseCase → DB (RUNNING) → EnhancedRunner
 * 3. EnhancedRunner → Docker execution → Results → DB (final state + test results)
 */
@Module({
  imports: [PrismaModule],
  controllers: [SubmissionController],
  providers: [
    // Repositories
    PrismaSubmissionRepository,
    PrismaChallengeRepository,

    // Observability
    ObservabilityService,

    // Queue
    SubmissionQueueService,

    // Use Cases
    CreateSubmissionUseCase,
    ProcessSubmissionUseCase,

    // Runner
    EnhancedRunnerService,

    // Worker (background service)
    SubmissionWorkerService,
  ],
  exports: [
    CreateSubmissionUseCase,
    ProcessSubmissionUseCase,
    SubmissionQueueService,
  ],
})
export class SubmissionModule {}
