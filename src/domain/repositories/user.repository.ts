import { Role, User } from '../entities/user.entity';

export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCodigo(codigo: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(codigo:string, data: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findByRole(role: Role): Promise<User[]>;
}