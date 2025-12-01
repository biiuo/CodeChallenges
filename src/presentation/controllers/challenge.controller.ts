import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import { CreateChallengeDto, CreateTestCaseDto } from '../../application/dtos/challenges';
import { UpdateChallengeDto } from '../../application/dtos/challenges';
import { CreateChallengeUseCase } from '../../application/usesCases/challenge/createchallenge.usecase';
import { FindChallengeByIdUseCase } from '../../application/usesCases/challenge/findchallengebyid.usecase';
import { FindAllChallengesUseCase } from '../../application/usesCases/challenge/findallchallenges.usecase';
import { UpdateChallengeUseCase } from '../../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../../application/usesCases/challenge/deletechallenge.usecase';
import type { ChallengeRepository } from '../../domain/repositories/challenge.repository';
import { Inject } from '@nestjs/common';
import { CHALLENGE_REPOSITORY } from '../../application/tokens';
import { Role } from '../../domain/entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@ApiTags('Challenges')
@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access')
@ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
export class ChallengesController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly getChallengeByIdUseCase: FindChallengeByIdUseCase,
    private readonly getAllChallengesUseCase: FindAllChallengesUseCase,
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
    @Inject(CHALLENGE_REPOSITORY) private readonly challengeRepo: ChallengeRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Crear un nuevo reto',
    description: 'Crea un nuevo reto algorítmico. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiBody({
    type: CreateChallengeDto,
    examples: {
      twoSum: {
        summary: 'Two Sum Challenge',
        value: {
          title: 'Two Sum',
          description: 'Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target.\n\nInput:\n- Primera línea: los números del array separados por espacio.\n- Segunda línea: el valor target.\n\nOutput:\n- Los dos índices separados por espacio (orden ascendente).',
          difficulty: 'EASY',
          tags: ['arrays', 'hash-table'],
          timeLimit: 1000,
          memoryLimit: 128,
          authorId: '00001111-2222-3333-4444-555566667777',
          isPublic: true
        }
      },
      fibonacci: {
        summary: 'Fibonacci Challenge',
        value: {
          title: 'Fibonacci Sequence',
          description: 'Escribe una función que calcule el n-ésimo número de Fibonacci.\n\nLa sucesión de Fibonacci se define como:\n- F(0) = 0\n- F(1) = 1\n- F(n) = F(n-1) + F(n-2) para n > 1\n\nInput:\n- Un único número entero n (0 <= n <= 30).\n\nOutput:\n- El n-ésimo número de Fibonacci.',
          difficulty: 'MEDIUM',
          tags: ['dynamic-programming', 'recursion', 'math'],
          timeLimit: 1000,
          memoryLimit: 128,
          authorId: '00001111-2222-3333-4444-555566667777',
          isPublic: true
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Reto creado exitosamente',
    schema: {
      example: {
        id: 'CH-ABCDE',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target...',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table'],
        timeLimit: 1000,
        memoryLimit: 128,
        status: 'DRAFT',
        isPublic: true,
        authorId: '00001111-2222-3333-4444-555566667777',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden crear retos.' })
  @ApiConflictResponse({ 
    description: 'Título duplicado. Ya existe un reto con este título.',
    schema: {
      example: {
        statusCode: 409,
        message: "Challenge with title 'Two Sum' already exists. Please choose a different title.",
        error: 'Conflict'
      }
    }
  })
  async create(@Body() data: CreateChallengeDto, @Req() req: any) {
    // Asignar el ID del usuario autenticado como autor del reto
    data.authorId = req.user.userId;
    
    // Asegurar que difficulty tenga un valor por defecto
    if (!data.difficulty) {
      data.difficulty = 'EASY' as any;
    }
    
    // Asegurar que tags sea un array válido
    if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
      data.tags = ['general'];
    }
    
    return await this.createChallengeUseCase.execute(data);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los retos',
    description: 'Devuelve una lista de todos los retos. Disponible para todos los usuarios autenticados.'
  })
  @ApiOkResponse({ 
    description: 'Lista de retos obtenida exitosamente',
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
          authorId: '00001111-2222-3333-4444-555566667777',
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
          authorId: '00001111-2222-3333-4444-555566667777',
          createdAt: '2025-10-29T11:00:00.000Z',
          updatedAt: '2025-10-29T11:00:00.000Z'
        }
      ]
    }
  })
  async findAll() {
    return await this.getAllChallengesUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener un reto por ID',
    description: 'Devuelve los detalles de un reto específico. Disponible para todos los usuarios autenticados. Los estudiantes pueden ver el código de solución si está disponible.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del reto',
    example: '00001111-2222-3333-4444-555566667777',
  })
  @ApiOkResponse({ 
    description: 'Reto encontrado exitosamente',
    schema: {
      example: {
        id: 'CH-ABCDE',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table'],
        timeLimit: 1000,
        memoryLimit: 128,
        status: 'PUBLISHED',
        isPublic: true,
        solutionCode: 'def two_sum(nums, target):\n    ...',
        solutionLanguage: 'python',
        authorId: '00001111-2222-3333-4444-555566667777',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const challenge = await this.getChallengeByIdUseCase.execute(id);
    const userRole = req.user?.role;
    
    // Solo estudiantes pueden ver el código de solución
    // Profesores y admin pueden ver todo
    if (userRole === 'STUDENT') {
      // El código de solución ya viene en el challenge si existe
      return challenge;
    }
    
    // Para profesores y admin, incluir también el código de solución
    return challenge;
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Actualizar un reto',
    description: 'Actualiza los datos de un reto existente. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del reto a actualizar',
    example: '00001111-2222-3333-4444-555566667777',
  })
  @ApiBody({
    type: UpdateChallengeDto,
    examples: {
      updateTitle: {
        summary: 'Actualizar título y descripción',
        value: {
          title: 'Two Sum - Updated',
          description: 'Updated description: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
          difficulty: 'EASY'
        }
      },
      publishChallenge: {
        summary: 'Publicar reto',
        value: {
          status: 'PUBLISHED',
          isPublic: true
        }
      },
      adjustLimits: {
        summary: 'Ajustar límites de tiempo y memoria',
        value: {
          timeLimit: 1500,
          memoryLimit: 256,
          tags: ['arrays', 'hash-table', 'two-pointers']
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Reto actualizado exitosamente',
    schema: {
      example: {
        id: 'CH-ABCDE',
        title: 'Two Sum - Updated',
        description: 'Updated description: Given an array of integers nums and an integer target...',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table', 'two-pointers'],
        timeLimit: 1500,
        memoryLimit: 256,
        status: 'PUBLISHED',
        isPublic: true,
        authorId: '00001111-2222-3333-4444-555566667777',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden actualizar retos.' })
  @ApiConflictResponse({ 
    description: 'Título duplicado. Ya existe otro reto con este título.',
    schema: {
      example: {
        statusCode: 409,
        message: "Challenge with title 'Two Sum' already exists. Please choose a different title.",
        error: 'Conflict'
      }
    }
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateChallengeDto,
  ) {
    return await this.updateChallengeUseCase.execute(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Eliminar un reto',
    description: 'Elimina permanentemente un reto del sistema. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del reto a eliminar',
    example: 'CH-ABCDE',
  })
  @ApiOkResponse({ 
    description: 'Reto eliminado exitosamente',
    schema: {
      example: {
        message: 'Challenge deleted successfully',
        id: 'CH-ABCDE',
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden eliminar retos.' })
  async delete(@Param('id') id: string) {
    return await this.deleteChallengeUseCase.execute(id);
  }

  @Post(':id/solution')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Subir código de solución de referencia',
    description: 'Sube el código de solución de referencia para un reto. Solo disponible para ADMIN y PROFESSOR. Los estudiantes podrán ver este código en los detalles del challenge.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del reto',
    example: 'CH-ABCDE',
  })
  @ApiBody({
    description: 'Código de solución y lenguaje',
    schema: {
      example: {
        code: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
        language: 'python'
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Código de solución subido exitosamente',
    schema: {
      example: {
        message: 'Solution code uploaded successfully',
        challengeId: 'CH-ABCDE'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden subir código de solución.' })
  async uploadSolution(
    @Param('id') challengeId: string,
    @Body() body: { code: string; language: string },
  ) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) {
      throw new Error(`Challenge ${challengeId} not found`);
    }
    
    // Actualizar el challenge con el código de solución
    await this.updateChallengeUseCase.execute(challengeId, {
      solutionCode: body.code,
      solutionLanguage: body.language,
    });
    
    return {
      message: 'Solution code uploaded successfully',
      challengeId,
    };
  }

  @Post(':id/testcases')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ 
    summary: 'Agregar casos de prueba a un reto',
    description: 'Agrega uno o más casos de prueba a un reto existente. Solo disponible para ADMIN y PROFESSOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del reto al que se agregarán los test cases',
    example: 'CH-ABCDE',
  })
  @ApiBody({
    description: 'Array de casos de prueba a agregar',
    type: [CreateTestCaseDto],
    examples: {
      twoSum: {
        summary: 'Agregar casos de prueba (Ejemplo Two Sum)',
        value: [
          { caseNumber: 1, input: '2 7 11 15\n9', output: '0 1', visible: true },
          { caseNumber: 2, input: '3 2 4\n6', output: '1 2', visible: false }
        ]
      },
      fibonacci: {
        summary: 'Agregar casos de prueba (Ejemplo Fibonacci)',
        value: [
          { caseNumber: 1, input: '0', output: '0', visible: true },
          { caseNumber: 2, input: '1', output: '1', visible: true },
          { caseNumber: 3, input: '5', output: '5', visible: true },
          { caseNumber: 4, input: '10', output: '55', visible: false }
        ]
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Casos de prueba agregados exitosamente',
    schema: {
      example: {
        message: 'Test cases added successfully',
        count: 2
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden agregar casos de prueba.' })
  async addTestCases(
    @Param('id') challengeId: string,
    @Body() testcases: CreateTestCaseDto[],
  ) {
    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) {
      throw new Error(`Challenge ${challengeId} not found`);
    }
    await this.challengeRepo.addTestCases(challengeId, testcases);
    return {
      message: 'Test cases added successfully',
      count: testcases.length,
    };
  }

  @Get(':id/testcases')
  @Roles(Role.ADMIN, Role.PROFESSOR, Role.STUDENT)
  @ApiOperation({ summary: 'Listar testcases por challenge (oculta invisible para STUDENT)' })
  async listTestcases(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    if (role === 'STUDENT') {
      return this.prisma.testcase.findMany({ where: { challengeId: id, visible: true } });
    }
    return this.prisma.testcase.findMany({ where: { challengeId: id } });
  }

  @Delete(':id/testcases/:caseNumber')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Eliminar testcase (ADMIN/PROFESSOR)' })
  async deleteTestcase(@Param('id') id: string, @Param('caseNumber') caseNumber: string) {
    await this.prisma.testcase.delete({ where: { challengeId_caseNumber: { challengeId: id, caseNumber: Number(caseNumber) } } });
    return { ok: true };
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Publicar challenge' })
  async publish(@Param('id') id: string) {
    return this.prisma.challenge.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  @Post(':id/archive')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Archivar challenge' })
  async archive(@Param('id') id: string) {
    return this.prisma.challenge.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  @Post(':id/assign-course/:courseId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Asignar challenge a curso' })
  async assignToCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.prisma.challenge.update({ where: { id }, data: { courses: { connect: { id: courseId } } } });
  }

  @Delete(':id/assign-course/:courseId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Desasignar challenge de curso' })
  async unassignFromCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.prisma.challenge.update({ where: { id }, data: { courses: { disconnect: { id: courseId } } } });
  }
}
