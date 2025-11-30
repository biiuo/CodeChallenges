import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { IsProfessorOfCourseGuard } from '../guards/is-professor-of-course.guard';

class CreateEvaluationDto {
  name!: string;
  description!: string;
  date!: string; // ISO date
  maxDuration!: number; // minutes
  courseId!: string;
}

class UpdateEvaluationDto {
  name?: string;
  description?: string;
  date?: string;
  maxDuration?: number;
}

@ApiTags('Evaluations')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Crear evaluación (ADMIN/PROFESSOR)' })
  async create(@Body() dto: CreateEvaluationDto, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: dto.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    const lastEval = await this.prisma.evaluation.findFirst({
      where: { courseId: dto.courseId },
      orderBy: { evaluationNumber: 'desc' },
    });
    const evaluationNumber = (lastEval?.evaluationNumber || 0) + 1;
    return this.prisma.evaluation.create({
      data: {
        name: dto.name,
        description: dto.description,
        date: new Date(dto.date),
        maxDuration: dto.maxDuration,
        courseId: dto.courseId,
        evaluationNumber,
      },
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    });
  }

  @Get()
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar evaluaciones' })
  async list(@Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    // STUDENT: Solo puede ver evaluaciones de cursos en los que está inscrito
    if (role === 'STUDENT' && userId) {
      const enrollments = await this.prisma.courseStudent.findMany({ 
        where: { userId }, 
        select: { courseId: true } 
      });
      const courseIds = enrollments.map(e => e.courseId);
      return this.prisma.evaluation.findMany({ 
        where: { courseId: { in: courseIds } },
        include: {
          course: {
            select: { id: true, name: true, code: true }
          },
          challenges: {
            include: {
              challenge: {
                select: { id: true, title: true, difficulty: true }
              }
            }
          }
        }
      });
    }
    
    // PROFESSOR: Solo puede ver evaluaciones de sus cursos
    if (role === 'PROFESSOR' && userId) {
      const professorCourses = await this.prisma.course.findMany({
        where: { professors: { some: { id: userId } } },
        select: { id: true }
      });
      const courseIds = professorCourses.map(c => c.id);
      return this.prisma.evaluation.findMany({ 
        where: { courseId: { in: courseIds } },
        include: {
          course: {
            select: { id: true, name: true, code: true }
          },
          challenges: {
            include: {
              challenge: {
                select: { id: true, title: true, difficulty: true }
              }
            }
          }
        }
      });
    }
    
    // ADMIN: Puede ver todas las evaluaciones
    return this.prisma.evaluation.findMany({
      include: {
        course: {
          select: { id: true, name: true, code: true }
        },
        challenges: {
          include: {
            challenge: {
              select: { id: true, title: true, difficulty: true }
            }
          }
        }
      }
    });
  }

  @Get(':id')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Obtener evaluación por id' })
  async get(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({ 
      where: { id: Number(id) }, 
      include: { 
        course: {
          select: { id: true, name: true, code: true }
        },
        challenges: {
          include: {
            challenge: {
              select: { id: true, title: true, description: true, difficulty: true, tags: true }
            }
          }
        }
      } 
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // STUDENT: Verificar que esté inscrito en el curso
    if (role === 'STUDENT' && userId) {
      const enrollment = await this.prisma.courseStudent.findUnique({
        where: { userId_courseId: { userId, courseId: evaluation.courseId } }
      });
      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    return evaluation;
  }

  @Put(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Actualizar evaluación (ADMIN/PROFESSOR del curso)' })
  async update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: Number(id) },
      select: { courseId: true }
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    return this.prisma.evaluation.update({
      where: { id: Number(id) },
      data: { 
        name: dto.name, 
        description: dto.description, 
        date: dto.date ? new Date(dto.date) : undefined, 
        maxDuration: dto.maxDuration 
      },
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    });
  }

  @Delete(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Eliminar evaluación (ADMIN/PROFESSOR del curso)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: Number(id) },
      select: { courseId: true }
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    return this.prisma.evaluation.delete({ 
      where: { id: Number(id) },
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    });
  }

  @Post(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Añadir challenge a evaluación (ADMIN/PROFESSOR del curso)' })
  async addChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: Number(id) },
      select: { courseId: true }
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    await this.prisma.evaluationChallenge.create({ data: { evaluationId: Number(id), challengeId } });
    return { ok: true };
  }

  @Delete(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Quitar challenge de evaluación (ADMIN/PROFESSOR del curso)' })
  async removeChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: Number(id) },
      select: { courseId: true }
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    await this.prisma.evaluationChallenge.delete({
      where: { evaluationId_challengeId: { evaluationId: Number(id), challengeId } },
    });
    return { ok: true };
  }

  @Get(':id/submissions')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar submissions de la evaluación' })
  async listSubmissions(
    @Param('id') id: string, 
    @Req() req: any,
    @Query('studentId') studentId?: string
  ) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    // STUDENT: Solo puede ver sus propios submissions de la evaluación
    if (role === 'STUDENT') {
      return this.prisma.submission.findMany({ 
        where: { 
          evaluationId: Number(id),
          userId: userId
        }, 
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, username: true }
          },
          challenge: {
            select: { id: true, title: true }
          }
        }
      });
    }
    
    // PROFESSOR/ADMIN: Pueden ver todos los submissions de la evaluación, con filtro opcional por estudiante
    const where: any = { evaluationId: Number(id) };
    if (studentId) {
      where.userId = studentId;
    }
    
    return this.prisma.submission.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, username: true }
        },
        challenge: {
          select: { id: true, title: true }
        }
      }
    });
  }

  @Get(':id/statistics')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Obtener estadísticas de la evaluación (ADMIN/PROFESSOR)' })
  async getEvaluationStatistics(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: Number(id) },
      select: { courseId: true }
    });
    
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    
    // PROFESSOR: Verificar que sea profesor del curso
    if (role === 'PROFESSOR' && userId) {
      const course = await this.prisma.course.findFirst({
        where: { 
          id: evaluation.courseId,
          professors: { some: { id: userId } }
        }
      });
      if (!course) {
        throw new Error('You are not a professor of this course');
      }
    }
    
    const totalSubmissions = await this.prisma.submission.count({
      where: { evaluationId: Number(id) }
    });

    const acceptedSubmissions = await this.prisma.submission.count({
      where: { evaluationId: Number(id), status: 'ACCEPTED' }
    });

    const uniqueStudents = await this.prisma.submission.groupBy({
      by: ['userId'],
      where: { evaluationId: Number(id) }
    });

    const submissionsByChallenge = await this.prisma.submission.groupBy({
      by: ['challengeId'],
      where: { evaluationId: Number(id) },
      _count: { challengeId: true },
      _avg: { score: true }
    });

    const topStudents = await this.prisma.submission.groupBy({
      by: ['userId'],
      where: { evaluationId: Number(id) },
      _sum: { score: true },
      _count: { userId: true }
    });

    const topStudentsWithNames = await Promise.all(
      topStudents
        .sort((a, b) => (b._sum.score || 0) - (a._sum.score || 0))
        .slice(0, 10)
        .map(async (s) => {
          const user = await this.prisma.user.findUnique({
            where: { id: s.userId },
            select: { id: true, name: true, username: true }
          });
          return {
            user,
            totalScore: s._sum.score || 0,
            totalSubmissions: s._count.userId
          };
        })
    );

    return {
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
      uniqueStudents: uniqueStudents.length,
      submissionsByChallenge: submissionsByChallenge.map(s => ({
        challengeId: s.challengeId,
        totalSubmissions: s._count.challengeId,
        averageScore: s._avg.score ? Math.round(s._avg.score) : 0
      })),
      topStudents: topStudentsWithNames
    };
  }
}
