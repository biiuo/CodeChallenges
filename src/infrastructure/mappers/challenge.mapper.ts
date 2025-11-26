// src/infrastructure/mappers/challenge.mapper.ts
import { Challenge, TestCase } from '../../domain/entities/challenge.entity';
import { Challenge as PrismaChallenge, Testcase as PrismaTestcase } from '@prisma/client';
import { EnumMapper } from './enum.mapper';
import { Difficulty } from '../../domain/entities/challenge.entity';

type PrismaChallengeWithTestcases = PrismaChallenge & {
  testcases?: PrismaTestcase[];
};

export class ChallengeMapper {
  static toDomain(prismaChallenge: PrismaChallengeWithTestcases): Challenge {
    const testCases: TestCase[] | undefined = prismaChallenge.testcases?.map(tc => ({
      challengeId: tc.challengeId,
      caseNumber: tc.caseNumber,
      input: tc.input,
      output: tc.output,
      visible: tc.visible,
      createdAt: tc.createdAt,
    }));

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
      testCases,
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
