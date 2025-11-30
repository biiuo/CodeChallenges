import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Injectable()
export class IsStudentOfCourseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.userId;
    const courseId: string | undefined = req.params?.id || req.params?.courseId;

    if (!userId || !courseId) throw new ForbiddenException('Missing user or course');

    const enrollment = await this.prisma.courseStudent.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');
    return true;
  }
}
