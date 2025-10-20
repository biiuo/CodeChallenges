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

export class challenge {
  constructor (
    public id: number,
    public title: string,
    public description: string,
    public difficulty: Difficulty,
    public tags: string[],
    public timeLimit: number,
    public memoryLimit: number,
    public status: ChallengeStatus,
    public authorId: number
  ) {}
}
