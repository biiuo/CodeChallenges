import { Injectable } from '@nestjs/common';
import * as userRepository from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepo: userRepository.UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
