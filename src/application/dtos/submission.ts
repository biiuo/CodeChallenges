import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';

// DTO para crear un envío (submission)
export class CreateSubmissionDto {
  @ApiProperty({ 
    example: 'python', 
    description: 'Lenguaje de programación',
    enum: ['python', 'javascript', 'cpp', 'java']
  })
  @IsString()
  language!: string;

  @ApiProperty({ 
    example: 'print("Hello World")', 
    description: 'Código fuente de la solución' 
  })
  @IsString()
  code!: string;

  @ApiProperty({ 
    example: 'CH-ABCDE', 
    description: 'ID del reto a resolver' 
  })
  @IsString()
  challengeId!: string;
}

// DTO para la respuesta de un submission
export class SubmissionResponseDto {
  @ApiProperty({ example: 123, description: 'ID único del submission' })
  id!: number;

  @ApiProperty({ example: '00001111-2222-3333-4444-555566667777', description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ example: 'CH-ABCDE', description: 'ID del reto' })
  challengeId!: string;

  @ApiProperty({ example: 'print("Hello World")', description: 'Código fuente' })
  code!: string;

  @ApiProperty({ example: 'python', description: 'Lenguaje', enum: ['python', 'javascript', 'cpp', 'java'] })
  language!: string;

  @ApiProperty({ example: 'QUEUED', description: 'Estado', enum: ['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'] })
  status!: string;

  @ApiProperty({ example: 0, description: 'Puntaje (0-100)' })
  score!: number;

  @ApiProperty({ example: 0, description: 'Tiempo total en ms' })
  timeMsTotal!: number;

  @ApiProperty({ example: '2025-11-25T23:45:30.000Z', description: 'Fecha de creación' })
  createdAt!: Date;
}

// DTO para actualizar el estado de un envío
export class UpdateSubmissionStatusDto {
  @ApiProperty({ example: 'ACCEPTED', description: 'Estado', enum: ['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'] })
  @IsEnum(['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'])
  status!: string;

  @ApiProperty({ example: 100, description: 'Puntaje (0-100)', required: false })
  @IsOptional()
  @IsInt()
  score?: number;

  @ApiProperty({ example: 1450, description: 'Tiempo total en ms', required: false })
  @IsOptional()
  @IsInt()
  timeMsTotal?: number;
}
