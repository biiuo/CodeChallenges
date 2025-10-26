import { Injectable,Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { UpdateChallengeDto } from '../../dtos/challenges';
import { Challenge } from '../../../domain/entities/challenge.entity';

@Injectable()
export class UpdateChallengeUseCase {
  constructor(
     @Inject('IChallengeRepository')
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(id: number, dto: UpdateChallengeDto): Promise<Challenge> {
    // 🧹 Convertir null → undefined
    const cleanDto: Partial<Challenge> = {
      ...dto,
      difficulty: dto.difficulty ?? undefined,
    };

    return this.challengeRepo.update(id, cleanDto);
  }
}
