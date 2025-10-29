import { Module } from '@nestjs/common';
import { CoursesController } from '../controllers/course.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { PrismaCourseRepository } from '../../infrastructure/repositories/prisma-course.repository';
import { CreateCourseUseCase } from '../../application/usesCases/course/createcourse.usecase';
import { FindCourseByCodeUseCase } from '../../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../../application/usesCases/course/deletecourse.usecase';
import { COURSE_REPOSITORY, USER_REPOSITORY } from 'src/application/tokens';

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
      provide: FindAllCoursesUseCase,
      useFactory: (repo: any) => new FindAllCoursesUseCase(repo),
      inject: [COURSE_REPOSITORY]
    },
  ],
})
export class CourseModule {}
