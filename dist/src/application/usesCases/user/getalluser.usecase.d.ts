import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
export declare class FindAllUsersUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(): Promise<User[]>;
}
