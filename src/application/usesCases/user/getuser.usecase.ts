import { Injectable, NotFoundException } from '@nestjs/common';
import * as userRepository from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepo: userRepository.UserRepository) {}

  async execute(id: string): Promise<User> {
    const u = await this.userRepo.findById(id);
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
}
