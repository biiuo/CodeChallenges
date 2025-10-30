import { Module } from '@nestjs/common';
import { ChallengesController } from '../controllers/challenge.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { PrismaChallengeRepository } from '../../infrastructure/repositories/prisma-challenge.repository';
import { CreateChallengeUseCase } from '../../application/usesCases/challenge/createchallenge.usecase';
import { FindAllChallengesUseCase } from '../../application/usesCases/challenge/findallchallenges.usecase';
import { FindChallengeByIdUseCase } from '../../application/usesCases/challenge/findchallengebyid.usecase';
import { UpdateChallengeUseCase } from '../../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../../application/usesCases/challenge/deletechallenge.usecase';
import { CHALLENGE_REPOSITORY } from 'src/application/tokens';

const usePrisma = !!process.env.DATABASE_URL;

@Module({
  controllers: [ChallengesController],
  providers: [
    ...([PrismaService]),
    {
      provide: CHALLENGE_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaChallengeRepository(prisma!);
      },
      inject: usePrisma ? [PrismaService] : [],
    },
    {
      provide: CreateChallengeUseCase,
      useFactory: (repo: any) => new CreateChallengeUseCase(repo),
      inject: [CHALLENGE_REPOSITORY]
    },
    {
      provide: DeleteChallengeUseCase,
      useFactory: (repo: any) => new DeleteChallengeUseCase(repo),
      inject: [CHALLENGE_REPOSITORY]
    },
    {
      provide: FindAllChallengesUseCase,
      useFactory: (repo: any) => new FindAllChallengesUseCase(repo),
      inject: [CHALLENGE_REPOSITORY]
    },
    {
      provide: FindChallengeByIdUseCase,
      useFactory: (repo: any) => new FindChallengeByIdUseCase(repo),
      inject: [CHALLENGE_REPOSITORY]
    },
    {
      provide: UpdateChallengeUseCase,
      useFactory: (repo: any) => new UpdateChallengeUseCase(repo),
      inject: [CHALLENGE_REPOSITORY]
    },
  ],
})
export class ChallengeModule {}
