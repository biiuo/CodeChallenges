// src/infrastructure/mappers/challenge.mapper.ts
import { Challenge } from '../../domain/entities/challenge.entity';
import { Challenge as PrismaChallenge } from '@prisma/client';
import { EnumMapper } from './enum.mapper';
import { Difficulty } from '../../domain/entities/challenge.entity';
export class ChallengeMapper {
  static toDomain(prismaChallenge: PrismaChallenge): Challenge {
    return new Challenge(
      prismaChallenge.id,
      prismaChallenge.title,
      prismaChallenge.description,
      EnumMapper.toDomainDifficulty(prismaChallenge.difficulty) ?? Difficulty.EASY,
      prismaChallenge.tags,
      prismaChallenge.timeLimit,
      prismaChallenge.memoryLimit,
      EnumMapper.toDomainChallengeStatus(prismaChallenge.status),
      prismaChallenge.isPublic,
      prismaChallenge.authorId,
    );
  }

  static toPrisma(domainChallenge: Challenge): Omit<PrismaChallenge, 'createdAt' | 'updatedAt'> {
    return {
      id: domainChallenge.id,
      title: domainChallenge.title,
      description: domainChallenge.description,
      difficulty: EnumMapper.toPrismaDifficulty(domainChallenge.difficulty),
      tags: domainChallenge.tags,
      timeLimit: domainChallenge.timeLimit,
      memoryLimit: domainChallenge.memoryLimit,
      status: EnumMapper.toPrismaChallengeStatus(domainChallenge.status),
      authorId: domainChallenge.authorId,
    } as PrismaChallenge;
  }
}
