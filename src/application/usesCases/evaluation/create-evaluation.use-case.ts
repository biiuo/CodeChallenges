import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';

export interface CreateEvaluationInput {
  courseId: string;
  name: string;
  description: string;
  date: string;
  maxDuration: number;
  challengeIds: string[];
}

@Injectable()
export class CreateEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateEvaluationInput) {
    // Validar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${input.courseId} not found`);
    }

    // Validar que todos los challenges existen
    const challenges = await this.prisma.challenge.findMany({
      where: { id: { in: input.challengeIds } },
    });

    if (challenges.length !== input.challengeIds.length) {
      throw new BadRequestException('One or more challenges not found');
    }

    // Obtener el siguiente evaluationNumber
    const lastEvaluation = await this.prisma.evaluation.findFirst({
      where: { courseId: input.courseId },
      orderBy: { evaluationNumber: 'desc' },
    });

    const evaluationNumber = lastEvaluation ? lastEvaluation.evaluationNumber + 1 : 1;

    // Crear la evaluación con sus challenges
    const evaluation = await this.prisma.evaluation.create({
      data: {
        evaluationNumber,
        name: input.name,
        description: input.description,
        date: new Date(input.date),
        maxDuration: input.maxDuration,
        courseId: input.courseId,
        challenges: {
          create: input.challengeIds.map((challengeId) => ({
            challengeId,
          })),
        },
      },
      include: {
        challenges: {
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return evaluation;
  }
}
