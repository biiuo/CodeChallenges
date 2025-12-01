import { Role } from '../../domain/entities/user.entity';
export declare const ROLES_KEY = "roles";
export type AllowedRole = Role | 'ADMIN' | 'PROFESSOR' | 'STUDENT';
export declare const Roles: (...roles: AllowedRole[]) => import("@nestjs/common").CustomDecorator<string>;
