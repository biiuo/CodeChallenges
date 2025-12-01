import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { UpdateChallengeDto } from '../../dtos/challenges';
import { Challenge } from '../../../domain/entities/challenge.entity';
export declare class UpdateChallengeUseCase {
    private readonly challengeRepo;
    constructor(challengeRepo: ChallengeRepository);
    execute(id: string, dto: UpdateChallengeDto): Promise<Challenge>;
}
