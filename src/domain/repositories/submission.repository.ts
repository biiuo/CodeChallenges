import { Submission,SubmissionStatus } from '../entities/submission.entity';


export interface SubmissionRepository {
  create(data: Partial<Submission>): Promise<Submission>;
  findById(id: number): Promise<Submission | null>;
  findByUser(userId: string): Promise<Submission[]>;
  findByChallenge(challengeId: string): Promise<Submission[]>;
  findAll(): Promise<Submission[]>;
  update(id: number, data: Partial<Submission>): Promise<Submission>;
  delete(id: number): Promise<void>;
  findByStatus(status: SubmissionStatus): Promise<Submission[]>;
}
