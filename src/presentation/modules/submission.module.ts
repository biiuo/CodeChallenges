import { Module } from '@nestjs/common';
import { SubmissionController } from '../controllers/submission.controller';
import { ProcessSubmissionUseCase } from 'src/application/usesCases/submission/process-submission.use-case';
import { PrismaSubmissionRepository } from 'src/infrastructure/repositories/prisma-submission.repository';
import { PrismaTestcaseRepository } from 'src/infrastructure/repositories/prisma-testcase.repository';
import { PrismaModule } from 'src/infrastructure/prisma.module';
import { RunnerModule } from 'src/infrastructure/runners/runner.module';
import { ObservabilityModule } from 'src/infrastructure/observability/observability.module';

@Module({
  imports: [PrismaModule, RunnerModule, ObservabilityModule],
  controllers: [SubmissionController],
  providers: [ProcessSubmissionUseCase, PrismaSubmissionRepository, PrismaTestcaseRepository],
  exports: [ProcessSubmissionUseCase, PrismaSubmissionRepository, PrismaTestcaseRepository],
})
export class SubmissionModule {}
