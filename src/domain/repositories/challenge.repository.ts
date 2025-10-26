import { Challenge } from '../entities/challenge.entity';
import { ChallengeStatus } from '../entities/challenge.entity';

export interface ChallengeRepository {
  create(data: Partial<Challenge>): Promise<Challenge>;
  findById(id: number): Promise<Challenge | null>;
  findAll(): Promise<Challenge[]>;
  findByCourse(courseId: number): Promise<Challenge[]>;
  findByStatus(status: ChallengeStatus): Promise<Challenge[]>;
  findPublished(): Promise<Challenge[]>; // published challenges only
  update(id: number, data: Partial<Challenge>): Promise<Challenge>;
  delete(id: number): Promise<void>;
}