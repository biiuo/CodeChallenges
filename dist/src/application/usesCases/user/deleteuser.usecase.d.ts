import { UserRepository } from '../../../domain/repositories/user.repository';
export declare class DeleteUserUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(id: string): Promise<void>;
}
