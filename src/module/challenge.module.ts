import { Module } from '@nestjs/common';
import { ChallengesController } from '../presentation/controllers/challenge.controller';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaChallengeRepository } from '../infrastructure/repositories/prisma-challenge.repository';
import { CreateChallengeUseCase } from '../application/usesCases/challenge/createchallenge.usecase';
import { FindAllChallengesUseCase } from '../application/usesCases/challenge/findallchallenges.usecase';
import { FindChallengeByIdUseCase } from '../application/usesCases/challenge/findchallengebyid.usecase';
import { UpdateChallengeUseCase } from '../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../application/usesCases/challenge/deletechallenge.usecase';

@Module({
  controllers: [ChallengesController],
  providers: [
    PrismaService,
    PrismaChallengeRepository,
    {
      provide: 'IChallengeRepository',
      useExisting: PrismaChallengeRepository,
    },
    CreateChallengeUseCase,
    FindAllChallengesUseCase,
    FindChallengeByIdUseCase,
    UpdateChallengeUseCase,
    DeleteChallengeUseCase,
  ],
})
export class ChallengeModule {}
