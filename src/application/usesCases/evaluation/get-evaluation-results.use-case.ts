import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

@Injectable()
export class GetEvaluationResultsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(evaluationId: number) {
    // Obtener la evaluación con sus challenges
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        challenges: {
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            students: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      return null;
    }

    const challengeIds = evaluation.challenges.map((ec) => ec.challengeId);

    // Obtener todas las submissions de esta evaluación
    const submissions = await this.prisma.submission.findMany({
      where: {
        evaluationId,
        challengeId: { in: challengeIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { userId: 'asc' },
        { challengeId: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Agrupar por estudiante y calcular puntaje total
    const studentResults = new Map<string, any>();

    for (const student of evaluation.course.students) {
      const userId = student.userId;
      const studentSubmissions = submissions.filter((s) => s.userId === userId);

      // Obtener la mejor submission de cada challenge
      const challengeScores = new Map<string, number>();
      
      for (const challengeId of challengeIds) {
        const challengeSubs = studentSubmissions.filter((s) => s.challengeId === challengeId);
        const bestScore = challengeSubs.length > 0
          ? Math.max(...challengeSubs.map((s) => s.score ?? 0))
          : 0;
        challengeScores.set(challengeId, bestScore);
      }

      const totalScore = Array.from(challengeScores.values()).reduce((a, b) => a + b, 0);
      const averageScore = challengeIds.length > 0 ? totalScore / challengeIds.length : 0;

      studentResults.set(userId, {
        student: student.user,
        challengeScores: Object.fromEntries(challengeScores),
        totalScore: Math.round(averageScore),
        submissions: studentSubmissions.map((s) => ({
          id: s.id,
          challengeId: s.challengeId,
          challengeTitle: s.challenge.title,
          status: s.status,
          score: s.score,
          createdAt: s.createdAt,
        })),
      });
    }

    return {
      evaluation: {
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description,
        date: evaluation.date,
        maxDuration: evaluation.maxDuration,
        challenges: evaluation.challenges.map((ec) => ec.challenge),
      },
      results: Array.from(studentResults.values()),
    };
  }
}
