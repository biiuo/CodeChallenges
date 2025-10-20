import { user } from '../entities/userEntity'

export interface userRepository {
  create(user: Partial<user>): Promise<user>;
  findById(codigo: string): Promise<user | null>;
  findAll(): Promise<user[]>;
  update(user: user): Promise<user>;
  delete(codigo: string): Promise<void>;
  findByEmail(email: string): Promise<user | null>;
  findByUsername(username: string): Promise<user | null>;
}