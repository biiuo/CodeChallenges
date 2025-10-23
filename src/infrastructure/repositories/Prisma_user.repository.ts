import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../persistence/Prisma.service';
import { Prisma } from '@prisma/client';
import { user as UserEntity, Role } from '../../domain/entities/userEntity';

export type FindUsersFilters = {
  role?: Role;
  search?: string; 
};

@Injectable()
export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaService) {}


  private toEntity(u: any): UserEntity {
    return new UserEntity(
      u.id,
      u.name,
      u.codigo,
      u.username,
      u.email,
      u.password,
      u.role as Role
    );
  }

  async create(payload: Partial<UserEntity>): Promise<UserEntity> {
    try {
      const created = await this.prisma.user.create({
        data: {
          name: payload.name!,
          codigo: payload.codigo ?? null, 
          username: payload.username!,
          email: payload.email!,
          password: payload.password!, 
          role: (payload.role ?? Role.STUDENT) as any, 
        },
      });
      return this.toEntity(created);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email or username already exists');
        }
      }
      throw new Error('Error creating user');
    }
  }

  async findAll(filters?: FindUsersFilters): Promise<UserEntity[]> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filters?.role) {
        where.role = filters.role as any;
      }

      if (filters?.search) {
        const q = filters.search;
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { codigo: { contains: q, mode: 'insensitive' } as any }, 
        ];
      }

      const rows = await this.prisma.user.findMany({
        where,

      });

      return rows.map(this.toEntity);
    } catch {
      throw new Error('Error fetching users');
    }
  }


  async findById(id: number): Promise<UserEntity> {
    try {
      const u = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!u) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return this.toEntity(u);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error('Error finding user');
    }
  }

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const u = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!u) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return this.toEntity(u);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error('Error finding user by email');
    }
  }

  async update(id: number, partial: Partial<UserEntity>): Promise<UserEntity> {
    try {
      const { id: _, ...data } = partial;

      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          codigo: data.codigo,
          username: data.username,
          email: data.email,
          password: data.password, 
          role: (data.role as any) ?? undefined,
        },
      });

      return this.toEntity(updated);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Email or username already exists');
        }
      }
      throw new Error('Error updating user');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new Error('Error deleting user');
    }
  }
}
