import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

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
  @IsArray()
  @IsString({ each: true })
  professorCode?: string[];
}