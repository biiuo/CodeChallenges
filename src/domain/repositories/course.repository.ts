import { Course } from '../entities/course.entity';

export interface CourseRepository {
  create(course: Partial<Course>): Promise<Course>;
  findByNrc(nrc: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(nrc: string, data: Partial<Course>): Promise<Course>;
  delete(nrc: string): Promise<void>;
}