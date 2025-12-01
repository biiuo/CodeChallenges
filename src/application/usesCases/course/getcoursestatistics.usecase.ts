// src/application/usesCases/course/getcoursestatistics.usecase.ts
import { CourseRepository } from '../../../domain/repositories/course.repository';
import { CourseNotFoundException } from '../../exceptions/course.exceptions';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';

export interface CourseStatistics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  totalChallenges: number;
  totalSubmissions: number;
  challengeStats: {
    challengeId: string;
    title: string;
    difficulty: string;
    totalAttempts: number;
    successfulSubmissions: number;
    successRate: number;
  }[];
  studentProgress: {
    studentId: string;
    studentName: string;
    challengesCompleted: number;
    totalSubmissions: number;
    averageScore: number;
  }[];
}

export class GetCourseStatisticsUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(courseId: string): Promise<CourseStatistics> {
    // 1. Validar que el curso existe
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    // 2. Obtener datos del curso con relaciones
    const courseData = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        challenges: {
          include: {
            submissions: {
              where: { courseId },
            },
          },
        },
        submissions: true,
      },
    });

    if (!courseData) {
      throw new CourseNotFoundException(courseId);
    }

    // 3. Calcular estadísticas de challenges
    const challengeStats = courseData.challenges.map((challenge) => {
      const totalAttempts = challenge.submissions.length;
      const successfulSubmissions = challenge.submissions.filter(
        (s) => s.status === 'ACCEPTED'
      ).length;
      const successRate = totalAttempts > 0 
        ? (successfulSubmissions / totalAttempts) * 100 
        : 0;

      return {
        challengeId: challenge.id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        totalAttempts,
        successfulSubmissions,
        successRate: Math.round(successRate * 100) / 100,
      };
    });

    // 4. Calcular progreso de estudiantes
    const studentProgress = courseData.students.map((enrollment) => {
      const studentSubmissions = courseData.submissions.filter(
        (s) => s.userId === enrollment.userId
      );

      const uniqueChallenges = new Set(
        studentSubmissions
          .filter((s) => s.status === 'ACCEPTED')
          .map((s) => s.challengeId)
      );

      const totalScore = studentSubmissions
        .filter((s) => s.score !== null)
        .reduce((sum, s) => sum + (s.score || 0), 0);
      
      const averageScore = studentSubmissions.length > 0
        ? totalScore / studentSubmissions.length
        : 0;

      return {
        studentId: enrollment.user.id,
        studentName: enrollment.user.name,
        challengesCompleted: uniqueChallenges.size,
        totalSubmissions: studentSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
      };
    });

    return {
      courseId: courseData.id,
      courseName: courseData.name,
      totalStudents: courseData.students.length,
      totalChallenges: courseData.challenges.length,
      totalSubmissions: courseData.submissions.length,
      challengeStats,
      studentProgress,
    };
  }
}
