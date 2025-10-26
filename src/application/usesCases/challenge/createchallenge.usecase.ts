import { Injectable,Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { Challenge,ChallengeStatus } from '../../../domain/entities/challenge.entity';
import {CreateChallengeDto } from '../../dtos/challenges';

@Injectable()
export class CreateChallengeUseCase {
  constructor(
    @Inject('IChallengeRepository')
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(dto: CreateChallengeDto): Promise<Challenge> {
    // Validaciones (comentadas) -> ej: comprobar difficulty, limits, tags length
    const challenge = new Challenge(
      0,
      dto.title,
      dto.description,
      dto.difficulty as any,
      dto.tags,
      dto.timeLimit,
      dto.memoryLimit,
      dto.status ? (dto.status as ChallengeStatus) : ChallengeStatus.DRAFT,
      dto.courseId // en tu entidad aparece authorId, pero si representas authorId pasa aquí
    );

    return this.challengeRepo.create(challenge);
  }
}
