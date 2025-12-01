export enum ChallengeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface TestCase {
  challengeId?: string; // Opcional porque ya está implícito en el Challenge
  caseNumber: number;
  input: string;
  output: string;
  visible: boolean;
  createdAt?: Date;
}

export class Challenge {
  constructor (
    public id: string,
    public title: string,
    public description: string,
    public difficulty: Difficulty,
    public tags: string[],
    public timeLimit: number,
    public memoryLimit: number,
    public status: ChallengeStatus,
    public isPublic: boolean,
    public authorId: string,
    public testCases?: TestCase[]
  ) {}
}