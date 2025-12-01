import { User } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
export declare class UserMapper {
    static toDomain(prismaUser: PrismaUser): User;
    static toPrisma(domainUser: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'>;
}
