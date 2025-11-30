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
  constructor(private readonly prisma: PrismaService) {}

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
    if (role === 'STUDENT') {
      return this.prisma.challenge.findMany({ where: { courses: { some: { id } }, status: 'PUBLISHED' } });
    }
    return this.prisma.challenge.findMany({ where: { courses: { some: { id } } } });
  }

  @Get(':id/my/challenges')
  @Roles('STUDENT')
  @UseGuards(IsStudentOfCourseGuard)
  @ApiOperation({ summary: 'Listar retos del curso (estudiante)' })
  async listMyChallenges(@Param('id') id: string) {
    return this.prisma.challenge.findMany({ where: { courses: { some: { id } }, status: 'PUBLISHED' } });
  }

  @Post(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Asignar reto al curso (ADMIN/PROFESSOR del curso)' })
  async assignChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    return this.prisma.challenge.update({ where: { id: challengeId }, data: { courses: { connect: { id } } } });
  }

  @Get(':id/submissions')
  @Roles('ADMIN','PROFESSOR')
  @UseGuards(IsProfessorOfCourseGuard)
  @ApiOperation({ summary: 'Listar submissions del curso con filtros' })
  @ApiOkResponse({ description: 'Lista de submissions' })
  async listSubmissions(
    @Param('id') id: string,
    @Query('studentId') studentId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('status') status?: string,
  ) {
    return this.prisma.submission.findMany({
      where: {
        courseId: id,
        userId: studentId || undefined,
        challengeId: challengeId || undefined,
        status: status as any || undefined,
      },
      orderBy: { createdAt: 'desc' },
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
  async listMySubmissions(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.prisma.submission.findMany({ where: { courseId: id, userId }, orderBy: { createdAt: 'desc' } });
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
}
