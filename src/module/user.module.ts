import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/controllers/user.controller';
import { UsersInfraModule } from 'src/infrastructure/users-infra.module';

@Module({
  imports: [UsersInfraModule],
  controllers: [UsersController],
})
export class UserModule {}
