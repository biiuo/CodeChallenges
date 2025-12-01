import type { UserRepository } from '../../domain/repositories/user.repository';
import type { HasherRepository } from '../../domain/repositories/hasher.repository';
import { Role } from '../../domain/entities/user.entity';
export declare class UsersController {
    private readonly userRepository;
    private readonly hasher;
    constructor(userRepository: UserRepository, hasher: HasherRepository);
    getAll(): Promise<{
        id: string;
        name: string;
        username: string;
        email: string;
        role: Role;
    }[]>;
    update(id: string, body: {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
        role?: string;
    }): Promise<{
        id: string;
        name: string;
        username: string;
        email: string;
        role: Role;
    }>;
    create(body: {
        name: string;
        username: string;
        email: string;
        password: string;
        role: string;
    }): Promise<{
        id: string;
        name: string;
        username: string;
        email: string;
        role: Role;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    me(req: any): Promise<{
        id: string;
        name: string;
        username: string;
        email: string;
        role: Role;
    }>;
    private parseRole;
}
