export enum role {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN'
}
export class User {
  constructor (
    public id: number,
    public name: string,
    public codigo: string,
    public username: string,
    public email: string,
    public password: string,
    public role: role,
  ) {}
}