import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { ChallengeStatus, Difficulty } from "src/domain/entities/challenge.entity";

// DTO para crear un reto
export class CreateChallengeDto {
  @ApiProperty({ 
    example: 'Two Sum', 
    description: 'Título del reto' 
  })
  @IsString()
  title!: string;

  @ApiProperty({ 
    example: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 
    description: 'Descripción detallada del problema' 
  })
  @IsString()
  description!: string;

  @ApiProperty({ 
    enum: Difficulty,
    example: Difficulty.EASY, 
    description: 'Nivel de dificultad del reto',
    required: false 
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty!: Difficulty | null;

  @ApiProperty({ 
    example: ['arrays', 'hash-table'], 
    description: 'Etiquetas temáticas del reto',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ 
    example: 1000, 
    description: 'Tiempo límite en milisegundos' 
  })
  @IsInt()
  timeLimit!: number;

  @ApiProperty({ 
    example: 128, 
    description: 'Límite de memoria en MB' 
  })
  @IsInt()
  memoryLimit!: number;

  @ApiProperty({ 
    example: 'cm123abc456def789', 
    description: 'ID del autor que crea el reto' 
  })
  @IsString()
  authorId!: string;

  @ApiProperty({ 
    enum: ChallengeStatus,
    example: ChallengeStatus.DRAFT, 
    description: 'Estado del reto',
    required: false 
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiProperty({ 
    example: true, 
    description: 'Si el reto es público o no',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO para actualizar un reto
export class UpdateChallengeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    enum: Difficulty, 
    required: false 
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty | null;

  @ApiProperty({ 
    type: [String], 
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  memoryLimit?: number;

  @ApiProperty({ 
    enum: ChallengeStatus, 
    required: false 
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courseCode?: string;
}
