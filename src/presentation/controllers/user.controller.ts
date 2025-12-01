import { Controller, Get, Post, Put, Delete, Req, Body, Param, UseGuards, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { USER_REPOSITORY, HASHER_REPOSITORY } from '../../application/tokens';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { HasherRepository } from '../../domain/repositories/hasher.repository';
import { User, Role } from '../../domain/entities/user.entity';
import { randomUUID } from 'crypto';

class UserProfileDoc {
  userId: string;
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(HASHER_REPOSITORY) private readonly hasher: HasherRepository,
  ) {}

  @Get()
  @Roles('ADMIN', 'PROFESSOR')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({ description: 'List of all users' })
  async getAll() {
    const users = await this.userRepository.findAll();
    return users.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role
    }));
  }

  @Put(':id')
  @Roles('ADMIN', 'PROFESSOR')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  @ApiOkResponse({ description: 'User updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; username?: string; email?: string; password?: string; role?: string }
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (body.email && body.email !== user.email) {
      const existing = await this.userRepository.findByEmail(body.email);
      if (existing) {
        throw new BadRequestException('Email already used');
      }
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.username) updateData.username = body.username;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = this.parseRole(body.role);
    if (body.password) updateData.passwordHash = await this.hasher.hash(body.password);

    updateData.id = id;
    const updated = await this.userRepository.update(id, updateData);

    return {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      role: updated.role
    };
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiOkResponse({ description: 'User created successfully' })
  async create(@Body() body: { name: string; username: string; email: string; password: string; role: string }) {
    const existing = await this.userRepository.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('Email already used');
    }

    const roleValue: Role = this.parseRole(body.role);
    const hash = await this.hasher.hash(body.password);
    const user = new User(randomUUID(), body.name, body.username, body.email, hash, roleValue);
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role
    };
    const created = await this.userRepository.create(userData);

    return {
      id: created.id,
      name: created.name,
      username: created.username,
      email: created.email,
      role: created.role
    };
  }

  @Delete(':id')
  @Roles('ADMIN', 'PROFESSOR')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  async delete(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Get('me')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve la información básica del usuario extraída del token JWT. Requiere un token de acceso válido en el encabezado **Authorization: Bearer &lt;token&gt;**.',
  })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
    type: UserProfileDoc,
    schema: {
      example: {
        userId: '00001111-2222-3333-4444-555566667777',
        role: 'STUDENT'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o no proporcionado',
  })
  async me(@Req() req: any) {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  private parseRole(value: string): Role {
    if ((Role as any)[value] !== undefined) return (Role as any)[value];
    const key = Object.keys(Role).find(k => k.toUpperCase() === value.toUpperCase());
    if (key) return (Role as any)[key];
    throw new BadRequestException(`Invalid role: ${value}`);
  }
}