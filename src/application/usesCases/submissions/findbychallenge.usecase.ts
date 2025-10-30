import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
import { Submission } from '../../../domain/entities/submission.entity';

export class FindSubmissionsByChallengeUseCase {
  constructor(private readonly submissionRepo: SubmissionRepository) {}

  async execute(challengeId: string): Promise<Submission[]> {
    return this.submissionRepo.findByChallenge(challengeId);
  }
}
