import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
export declare class DeleteChallengeUseCase {
    private readonly challengeRepository;
    constructor(challengeRepository: ChallengeRepository);
    execute(id: string): Promise<void>;
}
