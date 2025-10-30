import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

export class FindAllUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
