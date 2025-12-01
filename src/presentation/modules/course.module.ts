import { Module } from '@nestjs/common';
import { CoursesController } from '../controllers/course.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { PrismaCourseRepository } from '../../infrastructure/repositories/prisma-course.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaChallengeRepository } from '../../infrastructure/repositories/prisma-challenge.repository';
import { CreateCourseUseCase } from '../../application/usesCases/course/createcourse.usecase';
import { FindCourseByCodeUseCase } from '../../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../../application/usesCases/course/deletecourse.usecase';
import { AddChallengesToCourseUseCase } from '../../application/usesCases/course/addchallengestocourse.usecase';
import { RemoveChallengesFromCourseUseCase } from '../../application/usesCases/course/removechallengesfromcourse.usecase';
import { GetCourseChallengesUseCase } from '../../application/usesCases/course/getcoursechallenges.usecase';
import { GetCourseStatisticsUseCase } from '../../application/usesCases/course/getcoursestatistics.usecase';
import { CloneChallengesToCourseUseCase } from '../../application/usesCases/course/clonechallengstocourse.usecase';
import { PublishCourseUseCase } from '../../application/usesCases/course/publishcourse.usecase';
import { COURSE_REPOSITORY, USER_REPOSITORY, CHALLENGE_REPOSITORY } from 'src/application/tokens';
import { RolesGuard } from '../guards/roles.guard';

const usePrisma = !!process.env.DATABASE_URL;

@Module({
  controllers: [CoursesController],
  providers: [
    ...([PrismaService]),
    {
      provide: COURSE_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaCourseRepository(prisma!);
      },
      inject: usePrisma ? [PrismaService] : [],
    },
    {
      provide: USER_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaUserRepository(prisma!);
      },
      inject: usePrisma ? [PrismaService] : [],
    },
    {
      provide: CreateCourseUseCase,
      useFactory: (courseRepo: any, userRepo: any) => new CreateCourseUseCase(courseRepo, userRepo),
      inject: [COURSE_REPOSITORY, USER_REPOSITORY]
    },
    {
      provide: DeleteCourseUseCase,
      useFactory: (repo: any) => new DeleteCourseUseCase(repo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: FindAllCoursesUseCase,
      useFactory: (repo: any) => new FindAllCoursesUseCase(repo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: FindCourseByCodeUseCase,
      useFactory: (repo: any) => new FindCourseByCodeUseCase(repo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: UpdateCourseUseCase,
      useFactory: (repo: any) => new UpdateCourseUseCase(repo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: CHALLENGE_REPOSITORY,
      useFactory: (prisma?: PrismaService) => {
        return new PrismaChallengeRepository(prisma!);
      },
      inject: usePrisma ? [PrismaService] : [],
    },
    {
      provide: AddChallengesToCourseUseCase,
      useFactory: (courseRepo: any, challengeRepo: any) => 
        new AddChallengesToCourseUseCase(courseRepo, challengeRepo),
      inject: [COURSE_REPOSITORY, CHALLENGE_REPOSITORY]
    },
    {
      provide: RemoveChallengesFromCourseUseCase,
      useFactory: (courseRepo: any) => 
        new RemoveChallengesFromCourseUseCase(courseRepo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: GetCourseChallengesUseCase,
      useFactory: (courseRepo: any) => 
        new GetCourseChallengesUseCase(courseRepo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: GetCourseStatisticsUseCase,
      useFactory: (courseRepo: any, prisma: PrismaService) => 
        new GetCourseStatisticsUseCase(courseRepo, prisma),
      inject: [COURSE_REPOSITORY, PrismaService]
    },
    {
      provide: CloneChallengesToCourseUseCase,
      useFactory: (courseRepo: any) => 
        new CloneChallengesToCourseUseCase(courseRepo),
      inject: [COURSE_REPOSITORY]
    },
    {
      provide: PublishCourseUseCase,
      useFactory: (courseRepo: any) => 
        new PublishCourseUseCase(courseRepo),
      inject: [COURSE_REPOSITORY]
    },
    RolesGuard,
  ],
})
export class CourseModule {}
