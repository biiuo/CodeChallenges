import { Module } from '@nestjs/common';
import { CoursesController as CoursesExtendedController } from '../controllers/courses.controller';
import { CoursesCoverController } from '../controllers/courses-cover.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { CloudinaryService } from '../../infrastructure/cloudinary.service';
import { RolesGuard } from '../guards/roles.guard';
import { IsProfessorOfCourseGuard } from '../guards/is-professor-of-course.guard';
import { IsStudentOfCourseGuard } from '../guards/is-student-of-course.guard';

@Module({
  controllers: [CoursesExtendedController, CoursesCoverController],
  providers: [PrismaService, CloudinaryService, RolesGuard, IsProfessorOfCourseGuard, IsStudentOfCourseGuard],
  exports: [PrismaService, CloudinaryService],
})
export class CoursesExtendedModule {}
