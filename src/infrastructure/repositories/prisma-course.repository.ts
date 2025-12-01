// src/infrastructure/repositories/prisma-course.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
import { CourseMapper } from '../mappers/course.mapper';

@Injectable()
export class PrismaCourseRepository implements CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(course: Partial<Course>): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        code: course.code!,
        name: course.name!,
        period: course.period!,
        description: course.description,
        category: course.category,
        level: course.level,
        group: course.group,
        coverImage: course.coverImage,
        isPublished: course.isPublished ?? false,
      },
    });
    return CourseMapper.toDomain(created);
  }

  async createWithProfessors(course: Partial<Course>, professorIds: string[]): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        code: course.code!,
        name: course.name!,
        period: course.period!,
        description: course.description,
        category: course.category,
        level: course.level,
        group: course.group,
        coverImage: course.coverImage,
        isPublished: course.isPublished ?? false,
        professors: {
          connect: professorIds.map((id) => ({ id })),
        },
      },
      include: { professors: true },
    });
    return CourseMapper.toDomain(created);
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    return course ? CourseMapper.toDomain(course) : null;
  }

  async findByCode(code: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { code: code } });
    return course ? CourseMapper.toDomain(course) : null;
  }

 
  async findAll(): Promise<Course[]> {
    const courses = await this.prisma.course.findMany();
    return courses.map(CourseMapper.toDomain);
  }  async update(code: string, data: Partial<Course>): Promise<Course> {
    const updated = await this.prisma.course.update({
      where: { code },
      data,
    });
    return CourseMapper.toDomain(updated);
  }

  async delete(code: string): Promise<void> {
    await this.prisma.course.delete({ where: { code } });
  }

  // ========================================================
  // Métodos para gestionar challenges en cursos
  // ========================================================

  /**
   * Agrega uno o varios challenges a un curso.
   * Los challenges se conectan mediante la relación N:M.
   */
  async addChallengesToCourse(courseId: string, challengeIds: string[]): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        challenges: {
          connect: challengeIds.map((id) => ({ id })),
        },
      },
    });
  }

  /**
   * Remueve uno o varios challenges de un curso.
   */
  async removeChallengesFromCourse(courseId: string, challengeIds: string[]): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        challenges: {
          disconnect: challengeIds.map((id) => ({ id })),
        },
      },
    });
  }

  /**
   * Obtiene todos los challenges asociados a un curso.
   */
  async findChallengesByCourseId(courseId: string): Promise<any[]> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        challenges: {
          include: {
            testcases: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return course?.challenges || [];
  }

  /**
   * Verifica si un challenge específico está asociado a un curso.
   */
  async isChallengeInCourse(courseId: string, challengeId: string): Promise<boolean> {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        challenges: {
          some: { id: challengeId },
        },
      },
    });
    return !!course;
  }
}
