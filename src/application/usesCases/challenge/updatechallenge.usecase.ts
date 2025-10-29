import { Injectable,Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { UpdateChallengeDto } from '../../dtos/challenges';
import { Challenge } from '../../../domain/entities/challenge.entity';

@Injectable()
export class UpdateChallengeUseCase {
  constructor(
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(id: string, dto: UpdateChallengeDto): Promise<Challenge> {
    const cleanDto: Partial<Challenge> = {
      ...dto,
      difficulty: dto.difficulty ?? undefined,
    };

    return this.challengeRepo.update(id, cleanDto);
  }
}
