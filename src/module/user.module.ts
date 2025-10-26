import { Module } from '@nestjs/common';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository';
import { CreateUserUseCase} from '../application/usesCases/user/createuser.usecase';
import {FindUserByIdUseCase } from '../application/usesCases/user/getuser.usecase';
import { FindAllUsersUseCase } from '../application/usesCases/user/getalluser.usecase';
import { UpdateUserUseCase } from '../application/usesCases/user/updateuser.usecase';
import { DeleteUserUseCase } from '../application/usesCases/user/deleteuser.usecase';
import { UserController } from '../presentation/controllers/user.controllers';
import { USER_REPOSITORY } from '../application/tokens';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },

    {
      provide: CreateUserUseCase,
      useFactory: (repo: PrismaUserRepository) => new CreateUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide:FindUserByIdUseCase,
      useFactory: (repo: PrismaUserRepository) => new FindUserByIdUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateUserUseCase ,
      useFactory: (repo: PrismaUserRepository) => new UpdateUserUseCase (repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (repo: PrismaUserRepository) => new DeleteUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
        provide: FindAllUsersUseCase,
        useFactory: (repo: PrismaUserRepository) => new FindAllUsersUseCase(repo),
        inject: [USER_REPOSITORY],
    }
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
