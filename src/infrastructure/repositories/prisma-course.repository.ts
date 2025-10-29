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
    const course = await this.prisma.course.findUnique({ where: { code } });
    return course ? (course as unknown as Course) : null;
  }

 
  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }

  async update(code: string, data: Partial<Course>): Promise<Course> {
    const updated = await this.prisma.course.update({
      where: { code },
      data,
    });
    return CourseMapper.toDomain(updated);
  }

  async delete(code: string): Promise<void> {
    await this.prisma.course.delete({ where: { code } });
  }
}
