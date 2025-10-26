import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';

@Injectable()
export class FindChallengeByIdUseCase {
  constructor(
     @Inject('IChallengeRepository')
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(id: number): Promise<Challenge> {
    const ch = await this.challengeRepo.findById(id);
    if (!ch) throw new NotFoundException('Challenge not found');
    return ch;
  }
}
