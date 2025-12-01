import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';
export declare class FindAllChallengesUseCase {
    private readonly challengeRepo;
    constructor(challengeRepo: ChallengeRepository);
    execute(): Promise<Challenge[]>;
}
