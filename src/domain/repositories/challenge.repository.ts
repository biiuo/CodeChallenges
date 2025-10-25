import { Challenge } from '../entities/challenge.entity';

export interface ChallengeRepository {
  create(data: Partial<Challenge>): Promise<Challenge>;
  findById(id: number): Promise<Challenge | null>;
  findAll(): Promise<Challenge[]>;
  findPublished(): Promise<Challenge[]>;
  update(id: number, data: Partial<Challenge>): Promise<Challenge>;
  delete(id: number): Promise<void>;
}