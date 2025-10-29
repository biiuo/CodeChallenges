import { Module } from '@nestjs/common';
import { CoursesController } from '../presentation/controllers/course.controllers';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaCourseRepository } from '../infrastructure/repositories/prisma-course.repository';
import { CreateCourseUseCase } from '../application/usesCases/course/createcourse.usecase';
import { FindCourseByCodeUseCase } from '../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../application/usesCases/course/deletecourse.usecase';

@Module({
  controllers: [CoursesController],
  providers: [
    PrismaService,
    PrismaCourseRepository,
    {
      provide: 'ICourseRepository',
      useExisting: PrismaCourseRepository,
    },
    // 👇 Agrega TODOS tus casos de uso aquí:
    CreateCourseUseCase,
    FindCourseByCodeUseCase,
    FindAllCoursesUseCase,
    UpdateCourseUseCase,  // ← este faltaba
    DeleteCourseUseCase,
  ],
})
export class CourseModule {}
