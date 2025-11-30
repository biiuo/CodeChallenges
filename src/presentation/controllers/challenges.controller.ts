import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

class CreateChallengeDto {
  title!: string;
  description!: string;
  difficulty!: 'EASY'|'MEDIUM'|'HARD';
  tags!: string[];
  timeLimit!: number;
  memoryLimit!: number;
  isPublic?: boolean;
}

class UpdateChallengeDto {
  title?: string;
  description?: string;
  difficulty?: 'EASY'|'MEDIUM'|'HARD';
  tags?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  status?: 'DRAFT'|'PUBLISHED'|'ARCHIVED';
  isPublic?: boolean;
}

@ApiTags('Challenges')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Crear challenge (ADMIN/PROFESSOR)' })
  async create(@Body() dto: CreateChallengeDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.prisma.challenge.create({ 
      data: { 
        ...dto,
        authorId: userId
      } 
    });
  }

  @Get()
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar challenges' })
  async list() {
    return this.prisma.challenge.findMany();
  }

  @Get(':id')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Obtener challenge por id' })
  async get(@Param('id') id: string) {
    return this.prisma.challenge.findUnique({ where: { id } });
  }

  @Put(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Actualizar challenge (ADMIN/PROFESSOR)' })
  async update(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.prisma.challenge.update({ where: { id }, data: { ...dto } });
  }

  @Delete(':id')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Eliminar challenge (ADMIN/PROFESSOR)' })
  async remove(@Param('id') id: string) {
    return this.prisma.challenge.delete({ where: { id } });
  }

  @Get(':id/testcases')
  @Roles('ADMIN','PROFESSOR','STUDENT')
  @ApiOperation({ summary: 'Listar testcases por challenge (oculta invisible para STUDENT)' })
  async listTestcases(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    if (role === 'STUDENT') {
      return this.prisma.testcase.findMany({ where: { challengeId: id, visible: true } });
    }
    return this.prisma.testcase.findMany({ where: { challengeId: id } });
  }

  @Post(':id/testcases')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Subir testcases (ADMIN/PROFESSOR)' })
  async addTestcases(@Param('id') id: string, @Body() cases: { caseNumber: number; input: string; output: string; visible?: boolean }[]) {
    for (const c of cases) {
      await this.prisma.testcase.upsert({
        where: { challengeId_caseNumber: { challengeId: id, caseNumber: c.caseNumber } },
        update: { input: c.input, output: c.output, visible: c.visible ?? false },
        create: { challengeId: id, caseNumber: c.caseNumber, input: c.input, output: c.output, visible: c.visible ?? false },
      });
    }
    return { ok: true };
  }

  @Delete(':id/testcases/:caseNumber')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Eliminar testcase (ADMIN/PROFESSOR)' })
  async deleteTestcase(@Param('id') id: string, @Param('caseNumber') caseNumber: string) {
    await this.prisma.testcase.delete({ where: { challengeId_caseNumber: { challengeId: id, caseNumber: Number(caseNumber) } } });
    return { ok: true };
  }

  @Post(':id/publish')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Publicar challenge' })
  async publish(@Param('id') id: string) {
    return this.prisma.challenge.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  @Post(':id/archive')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Archivar challenge' })
  async archive(@Param('id') id: string) {
    return this.prisma.challenge.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  @Post(':id/assign-course/:courseId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Asignar challenge a curso' })
  async assignToCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.prisma.challenge.update({ where: { id }, data: { courses: { connect: { id: courseId } } } });
  }

  @Delete(':id/assign-course/:courseId')
  @Roles('ADMIN','PROFESSOR')
  @ApiOperation({ summary: 'Desasignar challenge de curso' })
  async unassignFromCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.prisma.challenge.update({ where: { id }, data: { courses: { disconnect: { id: courseId } } } });
  }
}
