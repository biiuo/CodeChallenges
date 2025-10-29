import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersInfraModule } from 'src/infrastructure/users-infra.module';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { RefreshStrategy } from 'src/strategies/refresh.strategy';


@Module({
  imports: [JwtModule.register({}), UsersInfraModule],
  controllers: [AuthController],
  providers: [JwtStrategy, RefreshStrategy],
})
export class AuthModule {}
