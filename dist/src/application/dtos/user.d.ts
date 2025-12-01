import { Role } from '../../domain/entities/user.entity';
export declare class RegisterDTO {
    username: string;
    name: string;
    email: string;
    password: string;
    role?: Role;
}
export declare class LoginDTO {
    email: string;
    password: string;
}
export declare class UpdateUserDTO {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    role?: string;
}
