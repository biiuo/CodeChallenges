// src/infrastructure/mappers/enum.mapper.ts
import {
  Role as DomainRole,
} from '../../domain/entities/user.entity';
import {
  ChallengeStatus as DomainChallengeStatus,
  Difficulty as DomainDifficulty,
} from '../../domain/entities/challenge.entity';
import {
  SubmissionStatus as DomainSubmissionStatus,
} from '../../domain/entities/submission.entity';

import {
  Role as PrismaRole,
  ChallengeStatus as PrismaChallengeStatus,
  Difficulty as PrismaDifficulty,
  SubmissionStatus as PrismaSubmissionStatus,
} from '@prisma/client';

export class EnumMapper {
  // User roles
  static toDomainRole(role: PrismaRole): DomainRole {
    return role as unknown as DomainRole;
  }
  static toPrismaRole(role: DomainRole): PrismaRole {
    return role as unknown as PrismaRole;
  }

  // Challenge enums
  static toDomainChallengeStatus(status: PrismaChallengeStatus): DomainChallengeStatus {
    return status as unknown as DomainChallengeStatus;
  }
  static toPrismaChallengeStatus(status: DomainChallengeStatus): PrismaChallengeStatus {
    return status as unknown as PrismaChallengeStatus;
  }

  static toDomainDifficulty(difficulty: PrismaDifficulty | null): DomainDifficulty | undefined {
    return difficulty as unknown as DomainDifficulty;
  }
  static toPrismaDifficulty(difficulty: DomainDifficulty | undefined): PrismaDifficulty | null {
    return difficulty as unknown as PrismaDifficulty;
  }

  // Submission status
  static toDomainSubmissionStatus(status: PrismaSubmissionStatus): DomainSubmissionStatus {
    return status as unknown as DomainSubmissionStatus;
  }
  static toPrismaSubmissionStatus(status: DomainSubmissionStatus): PrismaSubmissionStatus {
    return status as unknown as PrismaSubmissionStatus;
  }
}
