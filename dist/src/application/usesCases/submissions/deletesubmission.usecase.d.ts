import { SubmissionRepository } from '../../../domain/repositories/submission.repository';
export declare class DeleteSubmissionUseCase {
    private readonly submissionRepo;
    constructor(submissionRepo: SubmissionRepository);
    execute(id: number): Promise<void>;
}
