import { PrismaService } from '../persistence/prisma.service';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { User, Role } from 'src/domain/entities/user.entity';
export declare class PrismaUserRepository implements UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<User>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    findByRole(role: Role): Promise<User[]>;
    private toDomain;
}
