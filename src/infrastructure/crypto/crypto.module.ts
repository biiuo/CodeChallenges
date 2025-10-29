import { Global, Module } from '@nestjs/common';
import { Argon2Hasher } from './argon2.hasher';

@Global()
@Module({
  providers: [Argon2Hasher],
  exports: [Argon2Hasher],
})
export class CryptoModule {}
