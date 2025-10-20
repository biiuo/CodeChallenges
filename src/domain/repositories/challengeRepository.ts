import { challenge } from '../entities/challengeEntity';

export interface challengeRepository {
  create(data: Partial<challenge>): Promise<challenge>;
  findById(id: number): Promise<challenge | null>;
  findAll(): Promise<challenge[]>;
  findPublished(): Promise<challenge[]>;
  update(id: number, data: Partial<challenge>): Promise<challenge>;
  delete(id: number): Promise<void>;
}
