import { Challenge } from '../entities/challenge.entity';
import { ChallengeStatus } from '../entities/challenge.entity';

export interface ChallengeRepository {
  create(data: Partial<Challenge>): Promise<Challenge>;
  findById(id: string): Promise<Challenge | null>;
  findByTitle(title: string): Promise<Challenge | null>;
  findAll(): Promise<Challenge[]>;
  findByCourse(courseId: string): Promise<Challenge[]>;
  findByStatus(status: ChallengeStatus): Promise<Challenge[]>;
  findPublished(): Promise<Challenge[]>; // published challenges only
  update(id: string, data: Partial<Challenge>): Promise<Challenge>;
  delete(id: string): Promise<void>;
}