import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateCourseDTO {
  @ApiProperty({ example: 'PROG101', description: 'Código único del curso' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Introducción a la Programación', description: 'Nombre del curso' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2025-1', description: 'Período académico' })
  @IsString()
  period: string;

  @ApiProperty({ 
    example: 'Curso introductorio para aprender los fundamentos de la programación',
    description: 'Descripción del curso',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: 'web-development',
    description: 'Categoría del curso: web-development, data-science, algorithms, etc.',
    required: false 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    example: 'beginner',
    description: 'Nivel del curso: beginner, intermediate, advanced',
    required: false 
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ 
    example: '1',
    description: 'Grupo o sección del curso',
    required: false 
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ 
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen de portada del curso',
    required: false 
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ 
    example: true,
    description: 'Indica si el curso está publicado y visible',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ 
      example: ['PROF001', 'PROF002'], 
      description: 'Códigos de profesores asignados',
      required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  professorCode?: string[];
}

export class UpdateCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  professorCode?: string[];
}

export class AddChallengesToCourseDTO {
  @ApiProperty({ 
    example: ['CH-ABCDE', 'CH-FGHIJ'],
    description: 'Array de IDs de los challenges a agregar al curso'
  })
  @IsArray()
  @IsString({ each: true })
  challengeIds: string[];
}

export class RemoveChallengesToCourseDTO {
  @ApiProperty({ 
    example: ['CH-ABCDE', 'CH-FGHIJ'],
    description: 'Array de IDs de los challenges a remover del curso'
  })
  @IsArray()
  @IsString({ each: true })
  challengeIds: string[];
}