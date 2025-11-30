import { UserRepository } from 'src/domain/repositories/user.repository';
import { HasherRepository } from 'src/domain/repositories/hasher.repository';
import { Role, User } from 'src/domain/entities/user.entity';

export class SignupUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: HasherRepository,
    private readonly idGen: () => string,
  ) {}

  async execute(input: { name: string; username: string; email: string; password: string; role?: Role | string }): Promise<User> {
    // accept either a Role enum value or a string (e.g. "Admin"), default to STUDENT
    const roleValue: Role = input.role
      ? (typeof input.role === 'string' ? this.parseRole(input.role) : input.role)
      : Role.STUDENT;

    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new Error('Email already used');

    const hash = await this.hasher.hash(input.password);
    const candidate = new User(this.idGen(), input.name, input.username, input.email, hash, roleValue);
    const created = await this.users.create(candidate);
    return created;
  }

  private parseRole(value: string): Role {
    // try direct key lookup then case-insensitive match
    if ((Role as any)[value] !== undefined) return (Role as any)[value];
    const key = Object.keys(Role).find(k => k.toUpperCase() === value.toUpperCase());
    if (key) return (Role as any)[key];
    throw new Error(`Invalid role: ${value}`);
  }
}
