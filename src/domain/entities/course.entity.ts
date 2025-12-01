export class Course {
  constructor (
    public id: string,
    public code: string,
    public name: string,
    public period: string,
    public description?: string,
    public category?: string,
    public level?: string,
    public group?: string,
    public coverImage?: string,
    public isPublished?: boolean,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}