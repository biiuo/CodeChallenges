import { NotFoundException } from '@nestjs/common';
import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';

export class FindChallengeByIdUseCase {
  constructor(
    private readonly challengeRepo: ChallengeRepository) {}

  async execute(id: string): Promise<Challenge> {
    const ch = await this.challengeRepo.findById(id);
    if (!ch) throw new NotFoundException('Challenge not found');
    return ch;
  }
}
