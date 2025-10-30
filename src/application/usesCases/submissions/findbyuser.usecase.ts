import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
import { Submission } from '../../../domain/entities/submission.entity';

export class FindSubmissionsByUserUseCase {
  constructor(private readonly submissionRepo: SubmissionRepository) {}

  async execute(userId: string): Promise<Submission[]> {
    return this.submissionRepo.findByUser(userId);
  }
}
