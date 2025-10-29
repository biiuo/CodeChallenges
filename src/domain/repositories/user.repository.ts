import { Role, User } from '../entities/user.entity';

export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCodigo(code: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(code:string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findByRole(role: Role): Promise<User[]>;
}