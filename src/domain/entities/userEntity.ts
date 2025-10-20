export enum Role {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN'
}
export class user {
  constructor (
    public id: number,
    public name: string,
    public codigo: string,
    public username: string,
    public email: string,
    public password: string,
    public role: Role,
    
  ) {}
}
