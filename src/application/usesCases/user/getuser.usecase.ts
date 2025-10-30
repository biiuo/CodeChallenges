import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

export class FindUserByIdUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<User> {
    const u = await this.userRepo.findById(id);
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
}
