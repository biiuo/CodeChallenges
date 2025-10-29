import { UserRepository } from 'src/domain/repositories/user.repository';
import { HasherRepository } from 'src/domain/repositories/hasher.repository';
import { User } from 'src/domain/entities/user.entity';

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: HasherRepository,
  ) {}

  async execute(input: { email: string; password: string }): Promise<User> {
    const u = await this.users.findByEmail(input.email);
    if (!u) throw new Error('Invalid credentials');
    const ok = await this.hasher.verify(u.passwordHash, input.password);
    if (!ok) throw new Error('Invalid credentials');
    return u;
  }
}
