import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { Argon2Hasher } from './crypto/argon2.hasher';
import { USER_REPOSITORY, HASHER_REPOSITORY } from 'src/application/tokens';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: HASHER_REPOSITORY, useClass: Argon2Hasher },
  ],
  exports: [USER_REPOSITORY, HASHER_REPOSITORY],
})
export class UsersInfraModule {}
