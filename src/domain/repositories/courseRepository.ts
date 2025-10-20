import { course } from '../entities/courseEntity'

export interface courseRepository {
  create(course: Partial<course>): Promise<course>;
  findById(id: number): Promise<course | null>;
  findAll(): Promise<course[]>;
  update(id: number, data: Partial<course>): Promise<course>;
  delete(id: number): Promise<void>;
}