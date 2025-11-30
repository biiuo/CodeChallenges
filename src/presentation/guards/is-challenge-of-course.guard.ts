import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Injectable()
export class IsChallengeOfCourseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const courseId: string | undefined = req.params?.id || req.params?.courseId;
    const challengeId: string | undefined = req.params?.challengeId;

    if (!courseId || !challengeId) throw new ForbiddenException('Missing course or challenge');

    const exists = await this.prisma.challenge.findFirst({
      where: { id: challengeId, courses: { some: { id: courseId } } },
      select: { id: true },
    });
    if (!exists) throw new ForbiddenException('Challenge not assigned to course');
    return true;
  }
}
