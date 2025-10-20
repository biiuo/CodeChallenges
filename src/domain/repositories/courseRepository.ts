import { course } from '../entities/courseEntity'

export interface courseRepository {
  create(course: Partial<course>): Promise<course>;
  findByNrc(nrc: string): Promise<course | null>;
  findAll(): Promise<course[]>;
  update(nrc: string, data: Partial<course>): Promise<course>;
  delete(nrc: string): Promise<void>;
}