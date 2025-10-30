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
      },
      include: {
        courses: true,
        author: true
      }
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Challenge | null> {
    const found = await this.prisma.challenge.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByTitle(title: string): Promise<Challenge | null> {
    const found = await this.prisma.challenge.findFirst({ where: { title } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Challenge[]> {
    const list = await this.prisma.challenge.findMany();
    return list.map(this.toDomain);
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
        author: true
      }
    });
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
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
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
      prismaChallenge.isPublic,
      prismaChallenge.authorId,
    );
  }
}
