import { NotFoundException } from '@nestjs/common';
import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
import { SubmissionStatus } from '../../../domain/entities/submission.entity';

export class UpdateSubmissionStatusUseCase {
  constructor(private readonly submissionRepo: SubmissionRepository) {}

  async execute(id: number, status: SubmissionStatus, score?: number, timeMsTotal?: number) {
    const existing = await this.submissionRepo.findById(id);
    if (!existing) throw new NotFoundException('Submission not found');
    return this.submissionRepo.update(id, { status, score, timeMsTotal });
  }
}
