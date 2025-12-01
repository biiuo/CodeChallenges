import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';
import { CreateChallengeDto } from '../../dtos/challenges';
export declare class CreateChallengeUseCase {
    private readonly challengeRepo;
    private readonly logger;
    constructor(challengeRepo: ChallengeRepository);
    execute(dto: CreateChallengeDto): Promise<Challenge>;
    generateChallengeId(length?: number): string;
}
