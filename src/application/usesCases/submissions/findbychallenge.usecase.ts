import { Injectable } from '@nestjs/common';
import * as submissionRepository from '../../../domain/repositories/submission.repository';
import { Submission } from '../../../domain/entities/submission.entity';

@Injectable()
export class FindSubmissionsByChallengeUseCase {
  constructor(private readonly submissionRepo: submissionRepository.SubmissionRepository) {}

  async execute(challengeId: string): Promise<Submission[]> {
    return this.submissionRepo.findByChallenge(challengeId);
  }
}
