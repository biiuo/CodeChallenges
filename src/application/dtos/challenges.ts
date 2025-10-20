import { difficulty } from "../../domain/entities/challengeEntity";

export interface createChallengeDTO {
  title: string;
  description: string;
  difficulty: difficulty;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  courseNRC?: string;
}

export interface updateChallengeDTO {
  title?: string;
  description?: string;
  difficulty?: difficulty;
  tags?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  authorId?: number;
}
