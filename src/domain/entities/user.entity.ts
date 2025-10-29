export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR'
}
export class User {
  constructor (
    public id: string,
    public name: string,
    public codigo: string,
    public username: string,
    public email: string,
    public password: string,
    public role: Role,
  ) {}
}