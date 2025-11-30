import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
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
    });
  }

  @Get()
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar evaluaciones' })
  async list(@Req() req: any) {
    const role = req.user?.role;
    const userId = req.user?.userId;
    if (role === 'STUDENT' && userId) {
      // Student: only evaluations from enrolled courses
      const enrollments = await this.prisma.courseStudent.findMany({ where: { userId }, select: { courseId: true } });
      const courseIds = enrollments.map(e => e.courseId);
      return this.prisma.evaluation.findMany({ where: { courseId: { in: courseIds } } });
    }
    return this.prisma.evaluation.findMany();
  }

  @Get(':id')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Obtener evaluación por id' })
  async get(@Param('id') id: string) {
    return this.prisma.evaluation.findUnique({ where: { id: Number(id) }, include: { challenges: true } });
  }

  @Put(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Actualizar evaluación' })
  async update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.prisma.evaluation.update({
      where: { id: Number(id) },
      data: { name: dto.name, description: dto.description, date: dto.date ? new Date(dto.date) : undefined, maxDuration: dto.maxDuration },
    });
  }

  @Delete(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Eliminar evaluación' })
  async remove(@Param('id') id: string) {
    return this.prisma.evaluation.delete({ where: { id: Number(id) } });
  }

  @Post(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Añadir challenge a evaluación' })
  async addChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    await this.prisma.evaluationChallenge.create({ data: { evaluationId: Number(id), challengeId } });
    return { ok: true };
  }

  @Delete(':id/challenges/:challengeId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Quitar challenge de evaluación' })
  async removeChallenge(@Param('id') id: string, @Param('challengeId') challengeId: string) {
    await this.prisma.evaluationChallenge.delete({
      where: { evaluationId_challengeId: { evaluationId: Number(id), challengeId } },
    });
    return { ok: true };
  }

  @Get(':id/submissions')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Listar submissions de la evaluación' })
  async listSubmissions(@Param('id') id: string) {
    return this.prisma.submission.findMany({ where: { evaluationId: Number(id) }, orderBy: { createdAt: 'desc' } });
  }
}
