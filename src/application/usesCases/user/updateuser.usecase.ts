import { UserRepository } from '../../../domain/repositories/user.repository';
import { UpdateUserDTO } from '../../dtos/user';
import { User } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(codigo: string, dto: UpdateUserDTO): Promise<User> {
    const user = await this.userRepo.findByCodigo(codigo);
    if (!user) throw new Error('User not found');

    let updatedData: any = { ...dto };
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 10);
    }

    return this.userRepo.update(codigo, updatedData);
  }
}
