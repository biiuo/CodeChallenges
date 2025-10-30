import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';

export class FindAllChallengesUseCase {
  constructor(
    private readonly challengeRepo: ChallengeRepository) {}

  async execute(): Promise<Challenge[]> {
    return this.challengeRepo.findAll();
  }
}
