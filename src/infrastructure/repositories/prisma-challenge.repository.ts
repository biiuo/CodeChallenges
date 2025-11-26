import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { ChallengeRepository } from '../../domain/repositories/challenge.repository';
import { Challenge, ChallengeStatus, Difficulty } from '../../domain/entities/challenge.entity';
import { ChallengeMapper } from '../mappers/challenge.mapper';

@Injectable()
export class PrismaChallengeRepository implements ChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Challenge>): Promise<Challenge> {
    const created = await this.prisma.challenge.create({
      data: {
        id: data.id!,
        title: data.title!,
        description: data.description!,
        difficulty: data.difficulty ?? undefined,
        tags: data.tags ?? [],
        timeLimit: data.timeLimit!,
        memoryLimit: data.memoryLimit!,
        status: data.status ?? ChallengeStatus.DRAFT,
        isPublic: data.isPublic ?? false,
        authorId: data.authorId!,
        testcases: data.testCases ? {
          create: data.testCases.map(tc => ({
            caseNumber: tc.caseNumber,
            input: tc.input,
            output: tc.output,
            visible: tc.visible
          }))
        } : undefined
      },
      include: {
        testcases: true
      }
    });

    return ChallengeMapper.toDomain(created);
  }

  async findById(id: string): Promise<Challenge | null> {
    const found = await this.prisma.challenge.findUnique({ 
      where: { id },
      include: { testcases: true }
    });
    return found ? ChallengeMapper.toDomain(found) : null;
  }

  async findByTitle(title: string): Promise<Challenge | null> {
    const found = await this.prisma.challenge.findFirst({ 
      where: { title },
      include: { testcases: true }
    });
    return found ? ChallengeMapper.toDomain(found) : null;
  }

  async findAll(): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({
      include: { testcases: true }
    });
    return list.map(c => ChallengeMapper.toDomain(c));
  }

  async findByCourse(courseId: string): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({ 
      where: { 
        courses: {
          some: {
            id: courseId
          }
        }
      },
      include: {
        courses: true,
        author: true,
        testcases: true
      }
    });
    return list.map(c => ChallengeMapper.toDomain(c));
  }

  async findByStatus(status: ChallengeStatus): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({ 
      where: { status },
      include: { testcases: true }
    });
    return list.map(c => ChallengeMapper.toDomain(c));
  }

  async findPublished(): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({
      where: { status: ChallengeStatus.PUBLISHED },
      include: { testcases: true }
    });
    return list.map(c => ChallengeMapper.toDomain(c));
  }

  async update(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const updated = await this.prisma.challenge.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty ?? undefined, // ✅ acepta null
        tags: data.tags,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        status: data.status,
        isPublic: data.isPublic,
        authorId: data.authorId,
      },
      include: {
        testcases: true
      }
    });

    return ChallengeMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.challenge.delete({ where: { id } });
  }

  async addTestCases(challengeId: string, testcases: Array<{ caseNumber: number; input: string; output: string; visible?: boolean }>): Promise<void> {
    if (!testcases || testcases.length === 0) return;
    await this.prisma.testcase.createMany({
      data: testcases.map(tc => ({
        challengeId,
        caseNumber: tc.caseNumber,
        input: tc.input,
        output: tc.output,
        visible: tc.visible ?? false,
      })),
      skipDuplicates: true,
    });
  }

}
