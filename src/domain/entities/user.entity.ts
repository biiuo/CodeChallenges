export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR'
}

export class User {
  constructor (
    public id: string,
    public name: string,
    public code: string,
    public username: string,
    public email: string,
    private _password: string,
    public role: Role,
  ) {}
  get passwordHash() { return this._password; }
  setPasswordHash(newHash: string) { this._password = newHash; }
}