import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Injectable()
export class IsProfessorOfCourseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.userId;
    const userRole: string | undefined = req.user?.role;
    const courseId: string | undefined = req.params?.id || req.params?.courseId;

    console.log('[IsProfessorOfCourseGuard] userId:', userId, 'userRole:', userRole, 'courseId:', courseId);

    if (!userId || !courseId) {
      console.log('[IsProfessorOfCourseGuard] Missing user or course');
      throw new ForbiddenException('Missing user or course');
    }

    // ADMIN tiene acceso a todo
    if (userRole === 'ADMIN') return true;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { professors: { select: { id: true } } },
    });
    console.log('[IsProfessorOfCourseGuard] course:', course);
    if (!course) {
      console.log('[IsProfessorOfCourseGuard] Course not found for id:', courseId);
      throw new ForbiddenException('Course not found');
    }

    const isProfessor = course.professors.some(p => p.id === userId);
    console.log('[IsProfessorOfCourseGuard] isProfessor:', isProfessor);
    if (!isProfessor) {
      console.log('[IsProfessorOfCourseGuard] Not a professor of this course:', courseId, 'for user:', userId);
      throw new ForbiddenException('Not a professor of this course');
    }
    return true;
  }
}
