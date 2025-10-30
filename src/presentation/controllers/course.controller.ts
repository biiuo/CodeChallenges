import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { CreateCourseDTO } from '../../application/dtos/course';
import { Role } from '../../domain/entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

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
}
