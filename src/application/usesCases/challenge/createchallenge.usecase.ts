import { Injectable,Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { Challenge,ChallengeStatus } from '../../../domain/entities/challenge.entity';
import {CreateChallengeDto } from '../../dtos/challenges';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateChallengeUseCase {
  constructor(
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(dto: CreateChallengeDto): Promise<Challenge> {
    // Validaciones (comentadas) -> ej: comprobar difficulty, limits, tags length
    const challenge = new Challenge(
      randomUUID(),
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
}
