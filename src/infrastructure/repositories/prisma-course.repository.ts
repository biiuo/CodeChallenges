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
        nrc: course.nrc!,
        name: course.name!,
        period: course.period!,
        group: course.group!,
      },
    });
    return CourseMapper.toDomain(created);
  }

  async createWithProfessors(course: Partial<Course>, professorIds: number[]): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        nrc: course.nrc!,
        name: course.name!,
        period: course.period!,
        group: course.group!,
        professors: {
          connect: professorIds.map((id) => ({ id })),
        },
      },
      include: { professors: true },
    });
    return CourseMapper.toDomain(created);
  }

  async findById(id: number): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    return course ? CourseMapper.toDomain(course) : null;
  }

 async findByNrc(nrc: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { nrc } });
    return course ? (course as unknown as Course) : null;
  }

 
  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }

  async update(nrc: string, data: Partial<Course>): Promise<Course> {
    const updated = await this.prisma.course.update({
      where: { nrc },
      data,
    });
    return CourseMapper.toDomain(updated);
  }

  async delete(nrc: string): Promise<void> {
    await this.prisma.course.delete({ where: { nrc } });
  }
}
