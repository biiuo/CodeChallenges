import { userRepository } from '../../../domain/repositories/userRepository';

export class celeteUserUseCase {
  constructor(private readonly userRepo: userRepository) {}

  async execute(codigo: string): Promise<void> {
    const user = await this.userRepo.findById(codigo);
    if (!user) throw new Error('User not found');

    await this.userRepo.delete(codigo);
  }
}