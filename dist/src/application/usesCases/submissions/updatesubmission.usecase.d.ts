import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
import { SubmissionStatus } from '../../../domain/entities/submission.entity';
export declare class UpdateSubmissionStatusUseCase {
    private readonly submissionRepo;
    constructor(submissionRepo: SubmissionRepository);
    execute(id: number, status: SubmissionStatus, score?: number, timeMsTotal?: number): Promise<import("../../../domain/entities/submission.entity").Submission>;
}
