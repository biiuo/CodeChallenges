import { userRepository } from '../../../domain/repositories/userRepository';
import { user } from '../../../domain/entities/userEntity';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from 'application/dtos/user';

export class createUserUseCase {
  constructor(private readonly userRepo: userRepository) {}

  async execute(dto:RegisterDTO): Promise<user> {
    const existingEmail = await this.userRepo.findByEmail(dto.email);
    if (existingEmail) throw new Error('Email already exists');

    const existingUser = await this.userRepo.findByUsername(dto.username);
    if (existingUser) throw new Error('Username already exists');

    const password = await bcrypt.hash(dto.password, 10);
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    return this.userRepo.create({
      ...dto,
      codigo,
      password,
    });
  }
}
