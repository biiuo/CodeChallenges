import { HasherRepository } from 'src/domain/repositories/hasher.repository';
export declare class Argon2Hasher implements HasherRepository {
    hash(plain: string): Promise<string>;
    verify(hash: string, plain: string): Promise<boolean>;
}
