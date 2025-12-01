import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';
export declare class FindChallengeByIdUseCase {
    private readonly challengeRepo;
    constructor(challengeRepo: ChallengeRepository);
    execute(id: string): Promise<Challenge>;
}
