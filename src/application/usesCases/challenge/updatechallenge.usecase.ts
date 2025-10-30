import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { UpdateChallengeDto } from '../../dtos/challenges';
import { Challenge } from '../../../domain/entities/challenge.entity';
import { ChallengeTitleAlreadyExistsException, ChallengeNotFoundException } from '../../exceptions/challenge.exceptions';

export class UpdateChallengeUseCase {
  constructor(
    private readonly challengeRepo: ChallengeRepository) {}

  async execute(id: string, dto: UpdateChallengeDto): Promise<Challenge> {
    // Check if challenge exists
    const existingChallenge = await this.challengeRepo.findById(id);
    if (!existingChallenge) {
      throw new ChallengeNotFoundException(id);
    }

    // If title is being updated, check for duplicates (excluding current challenge)
    if (dto.title && dto.title !== existingChallenge.title) {
      const duplicateChallenge = await this.challengeRepo.findByTitle(dto.title);
      if (duplicateChallenge && duplicateChallenge.id !== id) {
        throw new ChallengeTitleAlreadyExistsException(dto.title);
      }
    }

    const cleanDto: Partial<Challenge> = {
      ...dto,
      difficulty: dto.difficulty ?? undefined,
    };

    return this.challengeRepo.update(id, cleanDto);
  }
}
