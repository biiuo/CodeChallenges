import { Injectable, NotFoundException } from '@nestjs/common';
import * as submissionRepository from '../../../domain/repositories/submission.repository';

@Injectable()
export class DeleteSubmissionUseCase {
  constructor(private readonly submissionRepo: submissionRepository.SubmissionRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.submissionRepo.findById(id);
    if (!existing) throw new NotFoundException('Submission not found');
    await this.submissionRepo.delete(id);
  }
}
