import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Injectable()
export class IsMemberOrProfessorOfCourseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.userId;
    const userRole: string | undefined = req.user?.role;
    const courseId: string | undefined = req.params?.id || req.params?.courseId;

    if (!userId || !courseId) {
      throw new ForbiddenException('Missing user or course');
    }

    // ADMIN tiene acceso a todo
    if (userRole === 'ADMIN') return true;

    // Verificar si es profesor
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { professors: { select: { id: true } }, students: { select: { userId: true } } },
    });
    if (!course) {
      throw new ForbiddenException('Course not found');
    }

    const isProfessor = course.professors.some(p => p.id === userId);
    const isStudent = course.students.some(s => s.userId === userId);
    if (!isProfessor && !isStudent) {
      throw new ForbiddenException('Not a member or professor of this course');
    }
    return true;
  }
}
