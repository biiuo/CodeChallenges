// src/infrastructure/mappers/user.mapper.ts
import { User } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { EnumMapper } from './enum.mapper';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.code,
      prismaUser.username,
      prismaUser.email,
      prismaUser.password,
      EnumMapper.toDomainRole(prismaUser.role),
    );
  }

  static toPrisma(domainUser: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: domainUser.id,
      name: domainUser.name,
      code: domainUser.code,
      username: domainUser.username,
      email: domainUser.email,
      password: domainUser.passwordHash,
      role: EnumMapper.toPrismaRole(domainUser.role),
    } as PrismaUser;
  }
}
