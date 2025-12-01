import { UserRepository } from '../../../domain/repositories/user.repository';
import { UpdateUserDTO } from '../../dtos/user';
import { User } from '../../../domain/entities/user.entity';
export declare class UpdateUserUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(id: string, dto: UpdateUserDTO): Promise<User>;
}
