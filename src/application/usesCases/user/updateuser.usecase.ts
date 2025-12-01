import { UserRepository } from '../../../domain/repositories/user.repository';
import { UpdateUserDTO } from '../../dtos/user';
import { User } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string, dto: UpdateUserDTO): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error('User not found');

    const updatedData: any = { ...dto };
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 10);
    }

    // repository.update currently expects code:string; change to use id field inside data
    return this.userRepo.update(user.id, {
      id: user.id,
      ...updatedData,
    });
  }
}
