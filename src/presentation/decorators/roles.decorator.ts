import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AllowedRole = 'ADMIN' | 'PROFESSOR' | 'STUDENT';

export const Roles = (...roles: AllowedRole[]) => SetMetadata(ROLES_KEY, roles);
