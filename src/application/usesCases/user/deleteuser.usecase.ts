import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    await this.userRepo.delete(id);
  }
}
