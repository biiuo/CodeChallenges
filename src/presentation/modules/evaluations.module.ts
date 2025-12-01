import { Module } from '@nestjs/common';
import { EvaluationsController } from '../controllers/evaluations.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { RolesGuard } from '../guards/roles.guard';
import { IsProfessorOfCourseGuard } from '../guards/is-professor-of-course.guard';

@Module({
  controllers: [EvaluationsController],
  providers: [PrismaService, RolesGuard, IsProfessorOfCourseGuard],
  exports: [PrismaService],
})
export class EvaluationsModule {}
