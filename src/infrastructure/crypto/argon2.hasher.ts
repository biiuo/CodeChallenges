import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { HasherRepository } from 'src/domain/repositories/hasher.repository';

@Injectable()
export class Argon2Hasher implements HasherRepository {
  hash(plain: string): Promise<string> { return argon2.hash(plain); }
  verify(hash: string, plain: string): Promise<boolean> { return argon2.verify(hash, plain); }
}
