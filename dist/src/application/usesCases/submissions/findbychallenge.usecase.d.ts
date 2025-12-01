import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
import { Submission } from '../../../domain/entities/submission.entity';
export declare class FindSubmissionsByChallengeUseCase {
    private readonly submissionRepo;
    constructor(submissionRepo: SubmissionRepository);
    execute(challengeId: string): Promise<Submission[]>;
}
