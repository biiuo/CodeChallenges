import { UserRepository } from 'src/domain/repositories/user.repository';
import { HasherRepository } from 'src/domain/repositories/hasher.repository';
import { Role, User } from 'src/domain/entities/user.entity';
export declare class SignupUseCase {
    private readonly users;
    private readonly hasher;
    private readonly idGen;
    constructor(users: UserRepository, hasher: HasherRepository, idGen: () => string);
    execute(input: {
        name: string;
        username: string;
        email: string;
        password: string;
        role?: Role | string;
    }): Promise<User>;
    private parseRole;
}
