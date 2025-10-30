import { NotFoundException } from '@nestjs/common';
import { SubmissionRepository } from '../../../domain/repositories/submission.repository';

export class DeleteSubmissionUseCase {
  constructor(private readonly submissionRepo: SubmissionRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.submissionRepo.findById(id);
    if (!existing) throw new NotFoundException('Submission not found');
    await this.submissionRepo.delete(id);
  }
}
