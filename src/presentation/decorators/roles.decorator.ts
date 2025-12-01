import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/entities/user.entity';

export const ROLES_KEY = 'roles';
export type AllowedRole = Role | 'ADMIN' | 'PROFESSOR' | 'STUDENT';

export const Roles = (...roles: AllowedRole[]) => SetMetadata(ROLES_KEY, roles);
