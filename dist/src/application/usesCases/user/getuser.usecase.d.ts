import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
export declare class FindUserByIdUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(id: string): Promise<User>;
}
