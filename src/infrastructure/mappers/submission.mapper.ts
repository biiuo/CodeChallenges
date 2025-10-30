// src/infrastructure/mappers/submission.mapper.ts
import { Submission } from '../../domain/entities/submission.entity';
import { Submission as PrismaSubmission } from '@prisma/client';
import { EnumMapper } from './enum.mapper';

export class SubmissionMapper {
  static toDomain(prismaSubmission: PrismaSubmission): Submission {
    return new Submission({
      id: prismaSubmission.id,
      language: prismaSubmission.language,
      code: prismaSubmission.code,
      status: EnumMapper.toDomainSubmissionStatus(prismaSubmission.status),
      score: prismaSubmission.score ?? undefined,
      timeMsTotal: prismaSubmission.timeMsTotal ?? undefined,
      createdAt: prismaSubmission.createdAt,
      userId: prismaSubmission.userId,
      challengeId: prismaSubmission.challengeId,
    });
  }

  static toPrisma(domainSubmission: Submission): Omit<PrismaSubmission, 'createdAt'> {
    return {
      id: domainSubmission.id,
      language: domainSubmission.language,
      code: domainSubmission.code,
      status: EnumMapper.toPrismaSubmissionStatus(domainSubmission.status),
      score: domainSubmission.score ?? null,
      timeMsTotal: domainSubmission.timeMsTotal ?? null,
      userId: domainSubmission.userId,
      challengeId: domainSubmission.challengeId,
    } as PrismaSubmission;
  }
}
