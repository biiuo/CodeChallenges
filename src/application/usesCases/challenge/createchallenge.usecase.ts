import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge, ChallengeStatus } from '../../../domain/entities/challenge.entity';
import { CreateChallengeDto } from '../../dtos/challenges';
import { ChallengeTitleAlreadyExistsException } from '../../exceptions/challenge.exceptions';

export class CreateChallengeUseCase {
  constructor(
    private readonly challengeRepo: ChallengeRepository) {}

  async execute(dto: CreateChallengeDto): Promise<Challenge> {
    // Check if challenge with same title already exists (globally unique)
    const existingChallenge = await this.challengeRepo.findByTitle(dto.title);
    if (existingChallenge) {
      throw new ChallengeTitleAlreadyExistsException(dto.title);
    }

    // Validations passed, create the challenge
    const challenge = new Challenge(
      this.generateChallengeId(),
      dto.title,
      dto.description,
      dto.difficulty as any,
      dto.tags,
      dto.timeLimit,
      dto.memoryLimit,
      dto.status ? (dto.status as ChallengeStatus) : ChallengeStatus.DRAFT,
      dto.isPublic ?? false,
      dto.authorId,
    );

    return this.challengeRepo.create(challenge);
  }

  generateChallengeId(length: number = 5): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'CH-';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('challenge id: '+ result);
    return result;
  }
}
