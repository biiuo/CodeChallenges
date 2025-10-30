// src/infrastructure/repositories/prisma-submission.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { SubmissionRepository } from '../../domain/repositories/submission.repository';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity';
import { SubmissionMapper } from '../mappers/submission.mapper';
import { EnumMapper } from '../mappers/enum.mapper';

@Injectable()
export class PrismaSubmissionRepository implements SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Submission>): Promise<Submission> {
    const created = await this.prisma.submission.create({
      data: SubmissionMapper.toPrisma(data as Submission),
    });
    return SubmissionMapper.toDomain(created);
  }

  async findById(id: number): Promise<Submission | null> {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    return submission ? SubmissionMapper.toDomain(submission) : null;
  }

  async findByUser(userId: string): Promise<Submission[]> {
    const subs = await this.prisma.submission.findMany({ where: { userId } });
    return subs.map(SubmissionMapper.toDomain);
  }

  async findByChallenge(challengeId: string): Promise<Submission[]> {
    const subs = await this.prisma.submission.findMany({ where: { challengeId } });
    return subs.map(SubmissionMapper.toDomain);
  }

  async findAll(): Promise<Submission[]> {
    const subs = await this.prisma.submission.findMany();
    return subs.map(SubmissionMapper.toDomain);
  }

  async update(id: number, data: Partial<Submission>): Promise<Submission> {
    const updated = await this.prisma.submission.update({
      where: { id },
      data: SubmissionMapper.toPrisma(data as Submission),
    });
    return SubmissionMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.submission.delete({ where: { id } });
  }

  async findByStatus(status: SubmissionStatus): Promise<Submission[]> {
    const subs = await this.prisma.submission.findMany({
      where: { status: EnumMapper.toPrismaSubmissionStatus(status) },
    });
    return subs.map(SubmissionMapper.toDomain);
  }
}
