import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { User, Role } from 'src/domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<User>): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        code: data.code!,
        username: data.username!,
        email: data.email!,
        password: data.passwordHash!,
        name: data.name!,
        role: data.role ?? Role.STUDENT,
      }
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByCodigo(code: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { code } });
    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => this.toDomain(user));
  }

  async update(code: string, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { code },
      data: {
        username: data.username,
        email: data.email,
        password: data.passwordHash,
        name: data.name,
        role: data.role,
      }
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findByRole(role: Role): Promise<User[]> {
    const users = await this.prisma.user.findMany({ 
      where: { role } 
    });
    return users.map(user => this.toDomain(user));
  }

  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.code,
      prismaUser.username,
      prismaUser.email,
      prismaUser.password,
      prismaUser.role as Role,
    );
  }
}
