import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { SubmissionStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users/:id/activity')
  async getUserActivity(
    @Param('id') userId: string,
    @Query('courseId') courseId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const whereSubmission: any = { userId };
    if (challengeId) whereSubmission.challengeId = challengeId;
    if (status) whereSubmission.status = status as SubmissionStatus;
    if (from || to) {
      whereSubmission.createdAt = {};
      if (from) whereSubmission.createdAt.gte = new Date(from);
      if (to) whereSubmission.createdAt.lte = new Date(to);
    }

    const submissions = await this.prisma.submission.findMany({
      where: whereSubmission,
      orderBy: { createdAt: 'desc' },
      include: {
        challenge: true,
        testResults: true,
      },
    });

    let filtered = submissions;
    if (courseId) {
      filtered = submissions.filter((s) => (s as any).challenge?.courseId === courseId);
    }

    const byChallenge: Record<string, any> = {};
    for (const s of filtered) {
      const cid = s.challengeId;
      const attempts = byChallenge[cid]?.attempts ?? 0;
      const bestScore = Math.max(byChallenge[cid]?.bestScore ?? 0, s.score ?? 0);
      byChallenge[cid] = {
        challengeId: cid,
        challengeTitle: (s as any).challenge?.title,
        attempts: attempts + 1,
        lastStatus: s.status,
        bestScore,
        lastSubmittedAt: s.createdAt,
      };
    }

    return {
      userId,
      filters: { courseId, challengeId, status, from, to },
      totals: {
        submissions: filtered.length,
        attempts: filtered.length,
        passed: filtered.filter((s) => s.status === SubmissionStatus.ACCEPTED).length,
        failed: filtered.filter((s) => s.status !== SubmissionStatus.ACCEPTED).length,
      },
      challenges: Object.values(byChallenge),
      submissions: filtered.map((s) => ({
        id: s.id,
        challengeId: s.challengeId,
        challengeTitle: (s as any).challenge?.title,
        status: s.status,
        score: s.score ?? 0,
        createdAt: s.createdAt,
        testCasesCount: s.testResults?.length ?? 0,
      })),
    };
  }
}
