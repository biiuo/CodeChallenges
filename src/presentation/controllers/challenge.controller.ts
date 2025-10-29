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
} from '@nestjs/swagger';
import { CreateChallengeDto } from '../../application/dtos/challenges';
import { UpdateChallengeDto } from '../../application/dtos/challenges';
import { CreateChallengeUseCase } from '../../application/usesCases/challenge/createchallenge.usecase';
import { FindChallengeByIdUseCase } from '../../application/usesCases/challenge/findchallengebyid.usecase';
import { FindAllChallengesUseCase } from '../../application/usesCases/challenge/findallchallenges.usecase';
import { UpdateChallengeUseCase } from '../../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../../application/usesCases/challenge/deletechallenge.usecase';
import { Role } from '../../domain/entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

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
  ) {}

  @Post()
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
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'EASY',
          tags: ['arrays', 'hash-table'],
          timeLimit: 1000,
          memoryLimit: 128,
          authorId: 'cm123abc456def789',
          isPublic: true
        }
      },
      fibonacci: {
        summary: 'Fibonacci Challenge',
        value: {
          title: 'Fibonacci Sequence',
          description: 'Write a function to calculate the nth Fibonacci number.',
          difficulty: 'MEDIUM',
          tags: ['dynamic-programming', 'recursion'],
          timeLimit: 2000,
          memoryLimit: 256,
          authorId: 'cm123abc456def789',
          isPublic: false
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Reto creado exitosamente',
    schema: {
      example: {
        id: 'cm2abc123def456',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target...',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table'],
        timeLimit: 1000,
        memoryLimit: 128,
        status: 'DRAFT',
        isPublic: true,
        authorId: 'cm123abc456def789',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden crear retos.' })
  async create(@Body() data: CreateChallengeDto) {
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
          id: 'cm2abc123def456',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target...',
          difficulty: 'EASY',
          tags: ['arrays', 'hash-table'],
          timeLimit: 1000,
          memoryLimit: 128,
          status: 'PUBLISHED',
          isPublic: true,
          authorId: 'cm123abc456def789',
          createdAt: '2025-10-29T10:30:00.000Z',
          updatedAt: '2025-10-29T10:30:00.000Z'
        },
        {
          id: 'cm2def456ghi789',
          title: 'Fibonacci Sequence',
          description: 'Write a function to calculate the nth Fibonacci number.',
          difficulty: 'MEDIUM',
          tags: ['dynamic-programming', 'recursion'],
          timeLimit: 2000,
          memoryLimit: 256,
          status: 'PUBLISHED',
          isPublic: false,
          authorId: 'cm123abc456def789',
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
    description: 'Devuelve los detalles de un reto específico. Disponible para todos los usuarios autenticados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del reto',
    example: 'cm2abc123def456'
  })
  @ApiOkResponse({ 
    description: 'Reto encontrado exitosamente',
    schema: {
      example: {
        id: 'cm2abc123def456',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table'],
        timeLimit: 1000,
        memoryLimit: 128,
        status: 'PUBLISHED',
        isPublic: true,
        authorId: 'cm123abc456def789',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.getChallengeByIdUseCase.execute(id);
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
    example: 'cm2abc123def456'
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
        id: 'cm2abc123def456',
        title: 'Two Sum - Updated',
        description: 'Updated description: Given an array of integers nums and an integer target...',
        difficulty: 'EASY',
        tags: ['arrays', 'hash-table', 'two-pointers'],
        timeLimit: 1500,
        memoryLimit: 256,
        status: 'PUBLISHED',
        isPublic: true,
        authorId: 'cm123abc456def789',
        createdAt: '2025-10-29T10:30:00.000Z',
        updatedAt: '2025-10-29T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden actualizar retos.' })
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
    example: 'cm2abc123def456'
  })
  @ApiOkResponse({ 
    description: 'Reto eliminado exitosamente',
    schema: {
      example: {
        message: 'Challenge deleted successfully',
        id: 'cm2abc123def456'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Reto no encontrado' })
  @ApiForbiddenResponse({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden eliminar retos.' })
  async delete(@Param('id') id: string) {
    return await this.deleteChallengeUseCase.execute(id);
  }
}
