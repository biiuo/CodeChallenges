import { Injectable, NotFoundException } from '@nestjs/common';
import * as userRepository from '../../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepo: userRepository.UserRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    await this.userRepo.delete(id);
  }
}
