import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

@Injectable()
export class GetStudentEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(evaluationId: number, userId: string) {
    // Obtener la evaluación
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        challenges: {
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                timeLimit: true,
                memoryLimit: true,
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      return null;
    }

    // Verificar si el estudiante está inscrito en el curso
    const enrollment = await this.prisma.courseStudent.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: evaluation.courseId,
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    // Verificar si la evaluación está activa
    const now = new Date();
    const startAt = evaluation.date;
    const endAt = new Date(startAt.getTime() + evaluation.maxDuration * 60_000);
    const isActive = now >= startAt && now <= endAt;

    // Obtener submissions del estudiante para esta evaluación
    const submissions = await this.prisma.submission.findMany({
      where: {
        evaluationId,
        userId,
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular puntaje total
    const challengeIds = evaluation.challenges.map((ec) => ec.challengeId);
    const challengeScores = new Map<string, number>();

    for (const challengeId of challengeIds) {
      const challengeSubs = submissions.filter((s) => s.challengeId === challengeId);
      const bestScore = challengeSubs.length > 0
        ? Math.max(...challengeSubs.map((s) => s.score ?? 0))
        : 0;
      challengeScores.set(challengeId, bestScore);
    }

    const totalScore = Array.from(challengeScores.values()).reduce((a, b) => a + b, 0);
    const averageScore = challengeIds.length > 0 ? totalScore / challengeIds.length : 0;

    return {
      evaluation: {
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description,
        date: evaluation.date,
        maxDuration: evaluation.maxDuration,
        isActive,
        startAt,
        endAt,
        challenges: evaluation.challenges.map((ec) => ec.challenge),
      },
      score: Math.round(averageScore),
      challengeScores: Object.fromEntries(challengeScores),
      submissions: submissions.map((s) => ({
        id: s.id,
        challengeId: s.challengeId,
        challengeTitle: s.challenge.title,
        status: s.status,
        score: s.score,
        timeMsTotal: s.timeMsTotal,
        createdAt: s.createdAt,
      })),
    };
  }
}
