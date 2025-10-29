import * as userRepository from '../../../domain/repositories/user.repository';
import { User ,Role} from '../../../domain/entities/user.entity';
import { RegisterDTO } from '../../dtos/user';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: userRepository.UserRepository) { }

  async execute(dto: RegisterDTO): Promise<User> {
    // Validaciones básicas (más adelante con class-validator)
    const existingEmail = await this.userRepo.findByEmail(dto.email);
    if (existingEmail) throw new Error('Email already exists');

    const existingUser = await this.userRepo.findByUsername(dto.username);
    if (existingUser) throw new Error('Username already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear entidad de dominio
    const user = new User(
      randomUUID(),
      dto.name ?? '',
      code,
      dto.username,
      dto.email,
      passwordHash,
      dto.role ?? Role.STUDENT
    );

    return this.userRepo.create(user);
  }
}
