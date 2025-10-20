export enum challengeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export class challenge {
  constructor (
    public id: number,
    public title: string,
    public description: string,
    public difficulty: difficulty,
    public tags: string[],
    public timeLimit: number,
    public memoryLimit: number,
    public status: challengeStatus,
    public authorId: number
  ) {}
}
