import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { IsProfessorOfCourseGuard } from '../guards/is-professor-of-course.guard';
import { IsMemberOrProfessorOfCourseGuard } from '../guards/is-member-or-professor-of-course.guard';
import { IsStudentOfCourseGuard } from '../guards/is-student-of-course.guard';

class CreateCourseDto {
  code!: string;
  name!: string;
  period!: string;
}

class UpdateCourseDto {
  name?: string;
  period?: string;
}

@ApiTags('Courses')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Obtener mis cursos (solo estudiante)' })
  async getMyCourses(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new Error('No userId');
    return this.prisma.course.findMany({
      where: { students: { some: { userId } } },
      select: { id: true, code: true, name: true, period: true, description: true, isPublished: true }
    });
  }

  @Post()
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Crear curso (ADMIN/PROFESSOR)' })
  async create(@Body() body: any, @Req() req: any) {
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const period = typeof body?.period === 'string' ? body.period.trim() : '';
    if (!code || !name || !period) {
      throw new Error('Invalid payload: code, name and period are required');
    }
    // Auto-asignar profesor autenticado
    const userId = req.user?.userId;
    const data: any = {
      code,
      name,
      period,
      professors: userId ? { connect: [{ id: userId }] } : undefined
    };
    if (body.level !== undefined) data.level = body.level;
    if (body.category !== undefined) data.category = body.category;
    if (body.group !== undefined) data.group = body.group;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage;
    return this.prisma.course.create({ data });
  }

  @Get()
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar cursos' })
  async list(@Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    if (role === 'PROFESSOR' && userId) {
      // Solo los cursos creados por el profesor
      return this.prisma.course.findMany({
        where: { professors: { some: { id: userId } } },
        select: {
          id: true,
          code: true,
          name: true,
          period: true,
          description: true,
          isPublished: true,
        }
      });
    }
    // Para estudiantes y admin, mostrar todos los cursos publicados
    return this.prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        code: true,
        name: true,
        period: true,
        description: true,
        isPublished: true,
      }
    });
  }

  @Get(':id')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsMemberOrProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Obtener curso por id (pertenencia requerida)' })
  async get(@Param('id') id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        period: true,
          description: true,
          isPublished: true,
          professors: { select: { id: true, name: true, username: true, email: true } }
        }
      });
  }

  @Get(':id/my')
  @Roles('STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Obtener curso por id (estudiante inscrito)' })
  async getMy(@Param('id') id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  @Put(':id')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Actualizar curso (ADMIN/PROFESSOR del curso)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: { name: dto.name, period: dto.period } });
  }

  @Delete(':id')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Eliminar curso (ADMIN/PROFESSOR del curso)' })
  async remove(@Param('id') id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  @Post(':id/professors/:userId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Asignar profesor a curso (ADMIN o el propio profesor)' })
  async assignProfessor(@Param('id') id: string, @Param('userId') userId: string, @Req() req: any) {
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    // Solo ADMIN o el propio profesor pueden asignarse
    if (requesterRole !== 'ADMIN' && requesterId !== userId) {
      throw new Error('Solo el admin o el propio profesor pueden asignarse');
    }
    return this.prisma.course.update({
      where: { id },
      data: { professors: { connect: { id: userId } } },
      include: { professors: true },
    });
  }

  @Post(':id/students/:userId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Inscribir estudiante en curso (ADMIN/PROFESSOR del curso)' })
  async enrollStudent(@Param('id') id: string, @Param('userId') userId: string) {
    await this.prisma.courseStudent.create({ data: { courseId: id, userId } });
    return { ok: true };
  }

  @Post(':id/enroll')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Auto-inscripción en curso (STUDENT)' })
  async selfEnroll(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const exists = await this.prisma.courseStudent.findUnique({ where: { userId_courseId: { userId, courseId: id } } });
    if (exists) return { ok: true, message: 'Already enrolled' };
    await this.prisma.courseStudent.create({ data: { courseId: id, userId } });
    return { ok: true, message: 'Enrolled successfully' };
  }

  @Delete(':id/unenroll')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Des-inscripción del curso (STUDENT)' })
  async selfUnenroll(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    await this.prisma.courseStudent.delete({ where: { userId_courseId: { userId, courseId: id } } });
    return { ok: true, message: 'Unenrolled successfully' };
  }

  @Get(':id/students')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsMemberOrProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar estudiantes del curso (miembros del curso o profesores)' })
  async listStudents(@Param('id') id: string) {
    return this.prisma.courseStudent.findMany({ where: { courseId: id }, include: { user: true } });
  }

  @Get(':id/challenges')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsMemberOrProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar retos del curso (miembros del curso o profesores)' })
  async listChallenges(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    
    console.log(`[listChallenges] CourseId: ${id}, Role: ${role}, UserId: ${userId}`);
    
    const includeOptions = {
      include: {
        testcases: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    };
    
    if (role === 'STUDENT') {
      const challenges = await this.prisma.challenge.findMany({ 
        where: { courses: { some: { id } }, status: 'PUBLISHED' },
        ...includeOptions
      });
      console.log(`[listChallenges] Found ${challenges.length} published challenges for student`);
      return challenges;
    }
    
    const challenges = await this.prisma.challenge.findMany({ 
      where: { courses: { some: { id } } },
      ...includeOptions
    });
    console.log(`[listChallenges] Found ${challenges.length} total challenges for admin/professor`);
    return challenges;
  }

  @Get(':id/my/challenges')
  @Roles('STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Listar retos del curso (estudiante)' })
  async listMyChallenges(@Param('id') id: string) {
    return this.prisma.challenge.findMany({ 
      where: { courses: { some: { id } }, status: 'PUBLISHED' },
      include: {
        testcases: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    });
  }

  @Post(':id/challenges')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Asignar múltiples retos al curso (ADMIN/PROFESSOR del curso)' })
  async assignMultipleChallenges(@Param('id') id: string, @Body() body: { challengeIds: string[] }) {
    const { challengeIds } = body;
    if (!Array.isArray(challengeIds) || challengeIds.length === 0) {
      throw new Error('challengeIds must be a non-empty array');
    }
    
    // Conectar múltiples challenges a la vez
    await this.prisma.course.update({
      where: { id },
      data: {
        challenges: {
          connect: challengeIds.map(challengeId => ({ id: challengeId }))
        }
      }
    });
    
    return {
      message: `Successfully added ${challengeIds.length} challenge(s) to course`,
      addedCount: challengeIds.length
    };
  }

  @Put(':id/challenges/:challengeId/publish')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Publicar/Despublicar un challenge del curso (ADMIN/PROFESSOR)' })
  async publishChallengeInCourse(
    @Param('id') id: string, 
    @Param('challengeId') challengeId: string,
    @Body() body: { status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' }
  ) {
    // Verificar que el challenge está en el curso
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        challenges: { some: { id: challengeId } }
      }
    });
    
    if (!course) {
      throw new Error('Challenge not found in this course');
    }
    
    // Actualizar el status del challenge
    const updated = await this.prisma.challenge.update({
      where: { id: challengeId },
      data: { status: body.status }
    });
    
    return {
      message: `Challenge ${body.status === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`,
      challenge: updated
    };
  }

  @Post(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Asignar un reto al curso (ADMIN/PROFESSOR del curso)' })
  async assignChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    return this.prisma.challenge.update({ where: { id: challengeId }, data: { courses: { connect: { id } } } });
  }

  @Get(':id/submissions')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar submissions del curso con filtros (ADMIN/PROFESSOR)' })
  @ApiOkResponse({ description: 'Lista de submissions' })
  async listSubmissions(
    @Param('id') id: string,
    @Query('studentId') studentId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('status') status?: string,
    @Query('evaluationId') evaluationId?: string,
  ) {
    const where: any = { courseId: id };
    
    if (studentId) {
      where.userId = studentId;
    }
    
    if (challengeId) {
      where.challengeId = challengeId;
    }
    
    if (status) {
      where.status = status as any;
    }
    
    if (evaluationId) {
      where.evaluationId = parseInt(evaluationId, 10);
    }
    
    return this.prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true }
        },
        challenge: {
          select: { id: true, title: true, difficulty: true }
        },
        evaluation: {
          select: { id: true, name: true, evaluationNumber: true }
        }
      }
    });
  }

  @Get(':id/challenges/:challengeId/submissions')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar submissions por curso y challenge' })
  async listSubmissionsByChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    return this.prisma.submission.findMany({ where: { courseId: id, challengeId }, orderBy: { createdAt: 'desc' } });
  }

  @Get(':id/my/submissions')
  @Roles('STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Listar mis submissions en el curso (STUDENT)' })
  async listMySubmissions(
    @Param('id') id: string, 
    @Req() req: any,
    @Query('evaluationId') evaluationId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('status') status?: string,
  ) {
    const userId = req.user?.userId;
    const where: any = { courseId: id, userId };
    
    if (evaluationId) {
      where.evaluationId = parseInt(evaluationId, 10);
    }
    
    if (challengeId) {
      where.challengeId = challengeId;
    }
    
    if (status) {
      where.status = status as any;
    }
    
    return this.prisma.submission.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      include: {
        challenge: {
          select: { id: true, title: true, difficulty: true }
        },
        evaluation: {
          select: { id: true, name: true, evaluationNumber: true }
        }
      }
    });
  }

  @Get(':id/evaluations/:evaluationId/submissions')
  @Roles('STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Listar submissions de una evaluación específica del curso (STUDENT - solo propias)' })
  async listMySubmissionsByEvaluation(
    @Param('id') courseId: string,
    @Param('evaluationId') evaluationId: string,
    @Req() req: any
  ) {
    const userId = req.user?.userId;
    
    // Verificar que la evaluación pertenezca al curso
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: parseInt(evaluationId, 10) },
      select: { courseId: true }
    });
    
    if (!evaluation || evaluation.courseId !== courseId) {
      throw new Error('Evaluation not found in this course');
    }
    
    return this.prisma.submission.findMany({ 
      where: { 
        courseId,
        evaluationId: parseInt(evaluationId, 10),
        userId 
      }, 
      orderBy: { createdAt: 'desc' },
      include: {
        challenge: {
          select: { id: true, title: true, difficulty: true }
        },
        testResults: {
          select: { caseNumber: true, status: true, timeMs: true }
        }
      }
    });
  }

  @Delete(':id/challenges')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Desasignar múltiples retos del curso (ADMIN/PROFESSOR del curso)' })
  async unassignMultipleChallenges(@Param('id') id: string, @Body() body: { challengeIds: string[] }) {
    const { challengeIds } = body;
    if (!Array.isArray(challengeIds) || challengeIds.length === 0) {
      throw new Error('challengeIds must be a non-empty array');
    }
    
    // Desconectar múltiples challenges a la vez
    await this.prisma.course.update({
      where: { id },
      data: {
        challenges: {
          disconnect: challengeIds.map(challengeId => ({ id: challengeId }))
        }
      }
    });
    
    return {
      message: `Successfully removed ${challengeIds.length} challenge(s) from course`,
      removedCount: challengeIds.length
    };
  }

  @Delete(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Desasignar reto del curso' })
  async unassignChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    return this.prisma.challenge.update({ where: { id: challengeId }, data: { courses: { disconnect: { id } } } });
  }

  @Delete(':id/students/:userId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Retirar estudiante del curso' })
  async removeStudent(@Param('id') id: string, @Param('userId') userId: string) {
    await this.prisma.courseStudent.delete({ where: { userId_courseId: { userId, courseId: id } } });
    return { ok: true };
  }

  @Delete(':id/professors/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retirar profesor del curso (ADMIN)' })
  async removeProfessor(@Param('id') id: string, @Param('userId') userId: string) {
    return this.prisma.course.update({ where: { id }, data: { professors: { disconnect: { id: userId } } } });
  }

  // ============================================
  // GESTIÓN DE METADATOS DEL CURSO
  // ============================================

  @Put(':id/metadata')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Actualizar metadatos del curso (descripción, categoría, nivel, grupo, imagen)' })
  async updateMetadata(@Param('id') id: string, @Body() body: any) {
    const updates: any = {};
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.level !== undefined) updates.level = body.level;
    // NRC removed
    if (body.group !== undefined) updates.group = body.group;
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
    return this.prisma.course.update({ where: { id }, data: updates });
  }

  // ============================================
  // GESTIÓN DE LECCIONES
  // ============================================

  @Get(':id/lessons')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Listar lecciones del curso ordenadas' })
  async listLessons(@Param('id') id: string) {
    return this.prisma.lesson.findMany({
      where: { courseId: id },
      include: { resources: true },
      orderBy: { order: 'asc' },
    });
  }

  @Post(':id/lessons')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Crear una lección en el curso' })
  async createLesson(@Param('id') id: string, @Body() body: any) {
    const { title, description, videoUrl, duration, order } = body;
    if (!title) throw new Error('Title is required');
    return this.prisma.lesson.create({
      data: {
        courseId: id,
        title,
        description,
        videoUrl,
        duration,
        order: order ?? 0,
      },
    });
  }

  @Put(':id/lessons/:lessonId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Actualizar una lección' })
  async updateLesson(@Param('id') courseId: string, @Param('lessonId') lessonId: string, @Body() body: any) {
    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.videoUrl !== undefined) updates.videoUrl = body.videoUrl;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.order !== undefined) updates.order = body.order;
    return this.prisma.lesson.update({ where: { id: lessonId }, data: updates });
  }

  @Delete(':id/lessons/:lessonId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Eliminar una lección' })
  async deleteLesson(@Param('id') courseId: string, @Param('lessonId') lessonId: string) {
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { ok: true };
  }

  // ============================================
  // GESTIÓN DE RECURSOS DE LECCIONES
  // ============================================

  @Post(':id/lessons/:lessonId/resources')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Agregar recurso a una lección' })
  async addResource(@Param('id') courseId: string, @Param('lessonId') lessonId: string, @Body() body: any) {
    const { title, url, type } = body;
    if (!title || !url || !type) throw new Error('title, url and type are required');
    return this.prisma.lessonResource.create({
      data: { lessonId, title, url, type },
    });
  }

  @Delete(':id/lessons/:lessonId/resources/:resourceId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Eliminar recurso de una lección' })
  async deleteResource(
    @Param('id') courseId: string,
    @Param('lessonId') lessonId: string,
    @Param('resourceId') resourceId: string
  ) {
    await this.prisma.lessonResource.delete({ where: { id: resourceId } });
    return { ok: true };
  }

  // ============================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================

  @Get(':id/statistics')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Obtener estadísticas del curso (ADMIN/PROFESSOR)' })
  async getCourseStatistics(@Param('id') courseId: string) {
    const totalStudents = await this.prisma.courseStudent.count({
      where: { courseId }
    });

    const totalChallenges = await this.prisma.challenge.count({
      where: { courses: { some: { id: courseId } } }
    });

    const totalSubmissions = await this.prisma.submission.count({
      where: { courseId }
    });

    const acceptedSubmissions = await this.prisma.submission.count({
      where: { courseId, status: 'ACCEPTED' }
    });

    const submissionsByStatus = await this.prisma.submission.groupBy({
      by: ['status'],
      where: { courseId },
      _count: { status: true }
    });

    const submissionsByLanguage = await this.prisma.submission.groupBy({
      by: ['language'],
      where: { courseId },
      _count: { language: true }
    });

    const averageScore = await this.prisma.submission.aggregate({
      where: { 
        courseId,
        score: { not: null }
      },
      _avg: { score: true }
    });

    return {
      totalStudents,
      totalChallenges,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
      averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score) : 0,
      submissionsByStatus: submissionsByStatus.map(s => ({
        status: s.status,
        count: s._count.status
      })),
      submissionsByLanguage: submissionsByLanguage.map(l => ({
        language: l.language,
        count: l._count.language
      }))
    };
  }

  @Get(':id/students/:studentId/statistics')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsMemberOrProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Obtener estadísticas de un estudiante en el curso' })
  async getStudentStatistics(
    @Param('id') courseId: string,
    @Param('studentId') studentId: string,
    @Req() req: any
  ) {
    const role = req.user?.role;
    const userId = req.user?.userId;

    // STUDENT: Solo puede ver sus propias estadísticas
    if (role === 'STUDENT' && userId !== studentId) {
      throw new Error('You can only view your own statistics');
    }

    const totalSubmissions = await this.prisma.submission.count({
      where: { courseId, userId: studentId }
    });

    const acceptedSubmissions = await this.prisma.submission.count({
      where: { courseId, userId: studentId, status: 'ACCEPTED' }
    });

    const submissionsByChallenge = await this.prisma.submission.groupBy({
      by: ['challengeId'],
      where: { courseId, userId: studentId },
      _count: { challengeId: true },
      _max: { score: true }
    });

    const averageScore = await this.prisma.submission.aggregate({
      where: { 
        courseId,
        userId: studentId,
        score: { not: null }
      },
      _avg: { score: true }
    });

    const bestSubmissions = await this.prisma.submission.findMany({
      where: { 
        courseId, 
        userId: studentId,
        status: 'ACCEPTED'
      },
      orderBy: { score: 'desc' },
      take: 5,
      include: {
        challenge: {
          select: { id: true, title: true, difficulty: true }
        }
      }
    });

    return {
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
      averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score) : 0,
      challengesAttempted: submissionsByChallenge.length,
      submissionsByChallenge: submissionsByChallenge.map(s => ({
        challengeId: s.challengeId,
        attempts: s._count.challengeId,
        bestScore: s._max.score
      })),
      bestSubmissions: bestSubmissions.map(s => ({
        id: s.id,
        challenge: s.challenge,
        score: s.score,
        timeMsTotal: s.timeMsTotal,
        createdAt: s.createdAt
      }))
    };
  }

  @Get(':id/evaluations')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @UseGuards(IsMemberOrProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar evaluaciones del curso' })
  async listEvaluations(@Param('id') courseId: string, @Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;

    const evaluations = await this.prisma.evaluation.findMany({
      where: { courseId },
      include: {
        challenges: {
          include: {
            challenge: {
              select: { id: true, title: true, difficulty: true }
            }
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { evaluationNumber: 'asc' }
    });

    // Para estudiantes, agregar información de sus submissions
    if (role === 'STUDENT' && userId) {
      const evaluationsWithStudentData = await Promise.all(
        evaluations.map(async (evaluation) => {
          const studentSubmissions = await this.prisma.submission.findMany({
            where: {
              evaluationId: evaluation.id,
              userId
            },
            select: {
              id: true,
              status: true,
              score: true,
              challengeId: true,
              createdAt: true
            }
          });

          return {
            ...evaluation,
            studentSubmissions,
            studentTotalScore: studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0),
            studentCompleted: studentSubmissions.length > 0
          };
        })
      );

      return evaluationsWithStudentData;
    }

    return evaluations;
  }
}
