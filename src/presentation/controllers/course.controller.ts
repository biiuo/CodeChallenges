import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateCourseUseCase } from '../../application/usesCases/course/createcourse.usecase';
import { FindCourseByCodeUseCase } from '../../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../../application/usesCases/course/deletecourse.usecase';
import { AddChallengesToCourseUseCase } from '../../application/usesCases/course/addchallengestocourse.usecase';
import { RemoveChallengesFromCourseUseCase } from '../../application/usesCases/course/removechallengesfromcourse.usecase';
import { GetCourseChallengesUseCase } from '../../application/usesCases/course/getcoursechallenges.usecase';
import { GetCourseStatisticsUseCase } from '../../application/usesCases/course/getcoursestatistics.usecase';
import { CloneChallengesToCourseUseCase } from '../../application/usesCases/course/clonechallengstocourse.usecase';
import { PublishCourseUseCase } from '../../application/usesCases/course/publishcourse.usecase';
import { CreateCourseDTO, AddChallengesToCourseDTO, RemoveChallengesToCourseDTO } from '../../application/dtos/course';
import { Role } from '../../domain/entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access')
@ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
export class CoursesController {
  constructor(
    private readonly createCourse: CreateCourseUseCase,
    private readonly findCourse: FindCourseByCodeUseCase,
    private readonly getAllCourses: FindAllCoursesUseCase,
    private readonly updateCourse: UpdateCourseUseCase,
    private readonly deleteCourse: DeleteCourseUseCase,
    private readonly addChallengesToCourse: AddChallengesToCourseUseCase,
    private readonly removeChallengesFromCourse: RemoveChallengesFromCourseUseCase,
    private readonly getCourseChallenges: GetCourseChallengesUseCase,
    private readonly getCourseStatistics: GetCourseStatisticsUseCase,
    private readonly cloneChallengesToCourse: CloneChallengesToCourseUseCase,
    private readonly publishCourse: PublishCourseUseCase,
    private readonly prisma?: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ 
    summary: 'Crear un nuevo curso',
    description: 'Crea un nuevo curso académico. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiBody({
    type: CreateCourseDTO,
    examples: {
      programmingCourse: {
        summary: 'Curso de Programación',
        value: {
          code: 'PROG101',
          name: 'Introducción a la Programación',
          period: '2025-1',
          professorCode: ['PROF2025001']
        }
      },
      algorithmsCourse: {
        summary: 'Curso de Algoritmos',
        value: {
          code: 'ALG301',
          name: 'Algoritmos y Estructuras de Datos',
          period: '2025-1',
          professorCode: ['PROF2025001']
        }
      },
      webDevCourse: {
        summary: 'Curso de Desarrollo Web',
        value: {
          code: 'WEB201',
          name: 'Desarrollo Web Full Stack',
          period: '2025-2',
          professorCode: ['PROF2025001']
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Curso creado exitosamente',
    schema: {
      example: {
        id: '00001111-2222-3333-4444-555566667777',
        code: 'PROG101',
        name: 'Introducción a la Programación',
        period: '2025-1',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden crear cursos.' })
  @ApiConflictResponse({ 
    description: 'El curso ya existe',
    schema: {
      example: {
        message: "Course with code 'PROG101' already exists",
        error: 'Conflict',
        statusCode: 409
      }
    }
  })
  async create(@Body() dto: CreateCourseDTO) {
    return this.createCourse.execute(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los cursos',
    description: 'Devuelve una lista de todos los cursos. Disponible para todos los usuarios autenticados.'
  })
  @ApiOkResponse({ 
    description: 'Lista de cursos obtenida exitosamente',
    schema: {
      example: [
        {
          id: '00001111-2222-3333-4444-555566667777',
          code: 'PROG101',
          name: 'Introducción a la Programación',
          period: '2025-1',
          createdAt: '2025-10-29T10:30:00.000Z',
          updatedAt: '2025-10-29T10:30:00.000Z'
        },
        {
          id: '00001111-2222-3333-4444-555566667777',
          code: 'ALG301',
          name: 'Algoritmos y Estructuras de Datos',
          period: '2025-1',
          createdAt: '2025-10-29T11:00:00.000Z',
          updatedAt: '2025-10-29T11:00:00.000Z'
        },
        {
          id: '00001111-2222-3333-4444-555566667777',
          code: 'WEB201',
          name: 'Desarrollo Web Full Stack',
          period: '2025-2',
          createdAt: '2025-10-29T11:30:00.000Z',
          updatedAt: '2025-10-29T11:30:00.000Z'
        }
      ]
    }
  })
  async findAll() {
    return this.getAllCourses.execute();
  }

  @Get('my')
  @ApiOperation({ 
    summary: 'Obtener cursos del usuario autenticado',
    description: 'Devuelve la lista de cursos en los que el usuario está inscrito.'
  })
  @ApiOkResponse({ description: 'Cursos del usuario obtenidos' })
  async findMy(@Req() req: any) {
    const userId = req.user?.id;
    // Fallback if PrismaService is not available
    if (!this.prisma) {
      // As a fallback, return all and let frontend filter (not ideal)
      return this.getAllCourses.execute();
    }
    const courses = await this.prisma.course.findMany({
      where: {
        students: {
          some: { userId: userId },
        },
      },
      include: {
        _count: { select: { students: true, challenges: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return courses;
  }

  @Get(':code')
  @ApiOperation({ 
    summary: 'Obtener un curso por código',
    description: 'Devuelve los detalles de un curso específico. Disponible para todos los usuarios autenticados.'
  })
  @ApiParam({
    name: 'code',
    description: 'Código único del curso',
    example: 'PROG101'
  })
  @ApiOkResponse({ 
    description: 'Curso encontrado exitosamente',
    schema: {
      example: {
        id: '00001111-2222-3333-4444-555566667777',
        code: 'PROG101',
        name: 'Introducción a la Programación',
        period: '2025-1',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  async findOne(@Param('code') code: string) {
    return this.findCourse.execute(code);
  }

  @Put(':code')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Actualizar un curso',
    description: 'Actualiza los datos de un curso existente. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'code',
    description: 'Código único del curso a actualizar',
    example: 'PROG101'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        period: { type: 'string' }
      }
    },
    examples: {
      updateName: {
        summary: 'Actualizar nombre del curso',
        value: {
          name: 'Introducción a la Programación - Actualizado',
          period: '2025-1'
        }
      },
      updatePeriod: {
        summary: 'Cambiar período',
        value: {
          period: '2025-2'
        }
      },
      fullUpdate: {
        summary: 'Actualización completa',
        value: {
          name: 'Fundamentos de Programación',
          period: '2025-2'
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Curso actualizado exitosamente',
    schema: {
      example: {
        id: '00001111-2222-3333-4444-555566667777',
        code: 'PROG101',
        name: 'Introducción a la Programación - Actualizado',
        period: '2025-1',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden actualizar cursos.' })
  async update(@Param('code') code: string, @Body() dto: any) {
    return this.updateCourse.execute(code, dto);
  }

  @Delete(':code')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Eliminar un curso',
    description: 'Elimina permanentemente un curso del sistema. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'code',
    description: 'Código único del curso a eliminar',
    example: 'PROG101'
  })
  @ApiOkResponse({ 
    description: 'Curso eliminado exitosamente',
    schema: {
      example: {
        message: 'Course deleted successfully',
        code: 'PROG101'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden eliminar cursos.' })
  async remove(@Param('code') code: string) {
    return this.deleteCourse.execute(code);
  }

  // ========================================================
  // GESTIÓN DE CHALLENGES EN CURSOS
  // ========================================================

  @Post(':id/challenges')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ 
    summary: 'Agregar challenges a un curso',
    description: 'Asocia uno o más retos algorítmicos a un curso específico. Solo disponible para ADMIN y PROFESSOR. Los estudiantes inscritos en el curso podrán acceder a estos retos.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiBody({
    type: AddChallengesToCourseDTO,
    examples: {
      singleChallenge: {
        summary: 'Agregar un reto',
        value: {
          challengeIds: ['CH-ABCDE']
        }
      },
      multipleChallenges: {
        summary: 'Agregar múltiples retos',
        value: {
          challengeIds: ['CH-ABCDE', 'CH-FGHIJ', 'CH-KLMNO']
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Challenges agregados exitosamente al curso',
    schema: {
      example: {
        message: 'Successfully added 3 challenge(s) to course',
        addedCount: 3,
        alreadyInCourse: []
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso o challenge(s) no encontrados' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden agregar challenges a cursos.' })
  async addChallenges(
    @Param('id') courseId: string,
    @Body() dto: AddChallengesToCourseDTO
  ) {
    return this.addChallengesToCourse.execute({
      courseId,
      challengeIds: dto.challengeIds
    });
  }

  @Delete(':id/challenges')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ 
    summary: 'Remover challenges de un curso',
    description: 'Desasocia uno o más retos de un curso específico. Solo disponible para ADMIN y PROFESSOR. Los estudiantes ya no podrán acceder a estos retos a través de este curso.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiBody({
    type: RemoveChallengesToCourseDTO,
    examples: {
      singleChallenge: {
        summary: 'Remover un reto',
        value: {
          challengeIds: ['CH-ABCDE']
        }
      },
      multipleChallenges: {
        summary: 'Remover múltiples retos',
        value: {
          challengeIds: ['CH-ABCDE', 'CH-FGHIJ']
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Challenges removidos exitosamente del curso',
    schema: {
      example: {
        message: 'Successfully removed 2 challenge(s) from course',
        removedCount: 2
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden remover challenges de cursos.' })
  async removeChallenges(
    @Param('id') courseId: string,
    @Body() dto: RemoveChallengesToCourseDTO
  ) {
    return this.removeChallengesFromCourse.execute({
      courseId,
      challengeIds: dto.challengeIds
    });
  }

  @Get(':id/challenges')
  @ApiOperation({ 
    summary: 'Obtener challenges de un curso',
    description: 'Devuelve la lista de todos los retos asociados a un curso específico. Disponible para todos los usuarios autenticados. Los estudiantes solo verán los retos del curso en el que están inscritos.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiOkResponse({ 
    description: 'Lista de challenges del curso obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'CH-ABCDE',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target...',
          difficulty: 'EASY',
          tags: ['arrays', 'hash-table'],
          timeLimit: 1000,
          memoryLimit: 128,
          status: 'PUBLISHED',
          isPublic: true,
          author: {
            id: '00001111-2222-3333-4444-555566667777',
            name: 'Prof. Juan Pérez',
            username: 'jperez'
          },
          testcases: [],
          createdAt: '2025-10-29T10:30:00.000Z',
          updatedAt: '2025-10-29T10:30:00.000Z'
        },
        {
          id: 'CH-FGHIJ',
          title: 'Fibonacci Sequence',
          description: 'Write a function to calculate the nth Fibonacci number.',
          difficulty: 'MEDIUM',
          tags: ['dynamic-programming', 'recursion'],
          timeLimit: 2000,
          memoryLimit: 256,
          status: 'PUBLISHED',
          isPublic: false,
          author: {
            id: '00001111-2222-3333-4444-555566667777',
            name: 'Prof. Juan Pérez',
            username: 'jperez'
          },
          testcases: [],
          createdAt: '2025-10-29T11:00:00.000Z',
          updatedAt: '2025-10-29T11:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  async getChallenges(@Param('id') courseId: string) {
    return this.getCourseChallenges.execute(courseId);
  }

  @Get(':id/statistics')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Obtener estadísticas del curso',
    description: 'Devuelve estadísticas detalladas del curso incluyendo progreso de estudiantes, estadísticas por challenge, y métricas generales. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiOkResponse({ 
    description: 'Estadísticas del curso obtenidas exitosamente',
    schema: {
      example: {
        courseId: '00001111-2222-3333-4444-555566667777',
        courseName: 'Introducción a la Programación',
        totalStudents: 25,
        totalChallenges: 5,
        totalSubmissions: 150,
        challengeStats: [
          {
            challengeId: 'CH-ABCDE',
            title: 'Two Sum',
            difficulty: 'EASY',
            totalAttempts: 50,
            successfulSubmissions: 35,
            successRate: 70.0
          }
        ],
        studentProgress: [
          {
            studentId: 'ST-12345',
            studentName: 'Ana García',
            challengesCompleted: 3,
            totalSubmissions: 8,
            averageScore: 85.5
          }
        ]
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden ver estadísticas.' })
  async getStatistics(@Param('id') courseId: string) {
    return this.getCourseStatistics.execute(courseId);
  }

  @Post(':targetId/clone-from/:sourceId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Clonar challenges de un curso a otro',
    description: 'Copia todos los challenges de un curso origen a un curso destino. Solo disponible para ADMIN y PROFESSOR. Útil para reutilizar retos entre diferentes grupos o períodos.'
  })
  @ApiParam({
    name: 'targetId',
    description: 'ID del curso destino (donde se copiarán los challenges)',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiParam({
    name: 'sourceId',
    description: 'ID del curso origen (desde donde se copiarán los challenges)',
    example: '00001111-2222-3333-4444-555566668888'
  })
  @ApiOkResponse({ 
    description: 'Challenges clonados exitosamente',
    schema: {
      example: {
        message: 'Successfully cloned 5 challenge(s) from source course to target course',
        clonedCount: 5,
        skippedCount: 2
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso origen o destino no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden clonar challenges.' })
  async cloneChallenges(
    @Param('targetId') targetCourseId: string,
    @Param('sourceId') sourceCourseId: string
  ) {
    return this.cloneChallengesToCourse.execute({
      sourceCourseId,
      targetCourseId
    });
  }

  @Put(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Publicar o despublicar un curso',
    description: 'Cambia el estado de publicación de un curso. Solo disponible para ADMIN y PROFESSOR. Los cursos publicados son visibles para inscripción de estudiantes.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '00001111-2222-3333-4444-555566667777'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPublished: { 
          type: 'boolean',
          description: 'true para publicar, false para despublicar'
        }
      },
      required: ['isPublished']
    },
    examples: {
      publish: {
        summary: 'Publicar curso',
        value: { isPublished: true }
      },
      unpublish: {
        summary: 'Despublicar curso',
        value: { isPublished: false }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Estado de publicación actualizado exitosamente',
    schema: {
      example: {
        message: 'Course published successfully. Students can now enroll.',
        courseId: '00001111-2222-3333-4444-555566667777',
        isPublished: true
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden publicar cursos.' })
  async publishUnpublish(
    @Param('id') courseId: string,
    @Body() body: { isPublished: boolean }
  ) {
    return this.publishCourse.execute(courseId, body.isPublished);
  }
}
