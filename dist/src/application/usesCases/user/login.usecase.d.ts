import { UserRepository } from 'src/domain/repositories/user.repository';
import { HasherRepository } from 'src/domain/repositories/hasher.repository';
import { User } from 'src/domain/entities/user.entity';
export declare class LoginUseCase {
    private readonly users;
    private readonly hasher;
    constructor(users: UserRepository, hasher: HasherRepository);
    execute(input: {
        email: string;
        password: string;
    }): Promise<User>;
}
