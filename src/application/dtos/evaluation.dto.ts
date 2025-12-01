import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsDateString, IsArray, Min, IsOptional } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ example: 'Parcial 1 - Estructuras de Datos' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Evaluación sobre listas, pilas y colas' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2025-12-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 90, description: 'Duración en minutos' })
  @IsInt()
  @Min(1)
  maxDuration: number;

  @ApiProperty({ example: ['CH-ABC123', 'CH-XYZ789'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  challengeIds: string[];

  @ApiProperty({ example: 'COURSE-123', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;
}

export class UpdateEvaluationDto {
  @ApiProperty({ example: 'Parcial 1 - Estructuras de Datos', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'Evaluación sobre listas, pilas y colas', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-12-15T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 90, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxDuration?: number;

  @ApiProperty({ example: ['CH-ABC123', 'CH-XYZ789'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  challengeIds?: string[];
}

export class EvaluationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  evaluationNumber: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  maxDuration: number;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [Object] })
  challenges?: any[];
}
