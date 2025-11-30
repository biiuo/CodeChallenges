import { Module } from '@nestjs/common';
import { ChallengesController } from '../controllers/challenges.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  controllers: [ChallengesController],
  providers: [PrismaService, RolesGuard],
  exports: [PrismaService],
})
export class ChallengesExtendedModule {}
