import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { ChallengeRepository } from '../../domain/repositories/challenge.repository';
import { Challenge, ChallengeStatus, Difficulty } from '../../domain/entities/challenge.entity';

@Injectable()
export class PrismaChallengeRepository implements ChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Challenge>): Promise<Challenge> {
    const created = await this.prisma.challenge.create({
      data: {
        title: data.title!,
        description: data.description!,
        difficulty: data.difficulty ?? undefined, // ✅ acepta null
        tags: data.tags ?? [],
        timeLimit: data.timeLimit!,
        memoryLimit: data.memoryLimit!,
        status: data.status ?? ChallengeStatus.DRAFT,
        courseId: data.courseId!,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: number): Promise<Challenge | null> {
    const found = await this.prisma.challenge.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany();
    return list.map(this.toDomain);
  }

  async findByCourse(courseId: number): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({ where: { courseId } });
    return list.map(this.toDomain);
  }

  async findByStatus(status: ChallengeStatus): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({ where: { status } });
    return list.map(this.toDomain);
  }

  async findPublished(): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany({
      where: { status: ChallengeStatus.PUBLISHED },
    });
    return list.map(this.toDomain);
  }

  async update(id: number, data: Partial<Challenge>): Promise<Challenge> {
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
        courseId: data.courseId,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.challenge.delete({ where: { id } });
  }

  // 🧭 Mapeo Prisma → Dominio
  private toDomain(prismaChallenge: any): Challenge {
    return new Challenge(
      prismaChallenge.id,
      prismaChallenge.title,
      prismaChallenge.description,
      prismaChallenge.difficulty ?? null, // ✅ null seguro
      prismaChallenge.tags ?? [],
      prismaChallenge.timeLimit,
      prismaChallenge.memoryLimit,
      prismaChallenge.status,
      prismaChallenge.courseId,
    );
  }
}
