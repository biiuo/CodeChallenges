import { Injectable,Inject } from '@nestjs/common';
import * as challengeRepository from '../../../domain/repositories/challenge.repository';
import { Challenge } from '../../../domain/entities/challenge.entity';

@Injectable()
export class FindAllChallengesUseCase {

  constructor(
    private readonly challengeRepo: challengeRepository.ChallengeRepository) {}

  async execute(): Promise<Challenge[]> {
    return this.challengeRepo.findAll();
  }
}
