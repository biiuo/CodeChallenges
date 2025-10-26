import { Injectable } from '@nestjs/common';
import * as submissionRepository from '../../../domain/repositories/submission.repository';
import { Submission } from '../../../domain/entities/submission.entity';

@Injectable()
export class FindSubmissionsByUserUseCase {
  constructor(private readonly submissionRepo: submissionRepository.SubmissionRepository) {}

  async execute(userId: number): Promise<Submission[]> {
    return this.submissionRepo.findByUser(userId);
  }
}
