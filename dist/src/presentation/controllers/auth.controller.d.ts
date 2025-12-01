import { JwtService } from '@nestjs/jwt';
import { SignupRequest, LoginRequest } from '../../application/dtos/auth.dto';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { HasherRepository } from '../../domain/repositories/hasher.repository';
export declare class AuthController {
    private readonly jwt;
    private readonly usersRepo;
    private readonly hasher;
    constructor(jwt: JwtService, usersRepo: UserRepository, hasher: HasherRepository);
    signup(dto: SignupRequest): Promise<{
        access: string;
        refresh: string;
    }>;
    login(dto: LoginRequest): Promise<{
        access: string;
        refresh: string;
    }>;
    refresh(req: any): Promise<{
        access: string;
        refresh: string;
    }>;
    private signTokens;
}
