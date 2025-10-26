// src/infrastructure/repositories/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { EnumMapper } from '../mappers/enum.mapper';
import { Role } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        codigo: data.codigo!,
        username: data.username!,
        email: data.email!,
        password: data.password!,
        name: data.name!,
        role: EnumMapper.toPrismaRole(data.role!),
      },
    });
    return UserMapper.toDomain(user);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByCodigo(codigo: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { codigo } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(UserMapper.toDomain);
  }

  async update(codigo: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { codigo },
      data: {
        name: data.name,
        password: data.password,
        role: data.role ? EnumMapper.toPrismaRole(data.role) : undefined,
      },
    });
    return UserMapper.toDomain(user);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findByRole(role: Role): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: EnumMapper.toPrismaRole(role) },
    });
    return users.map(UserMapper.toDomain);
  }
}
