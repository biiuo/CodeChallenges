import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeStatus, Difficulty } from "src/domain/entities/challenge.entity";

// DTO para TestCase
export class CreateTestCaseDto {
  @ApiProperty({ 
    example: 1, 
    description: 'Número del caso de prueba' 
  })
  @IsInt()
  caseNumber!: number;

  @ApiProperty({ 
    example: '2 7 11 15\n9', 
    description: 'Entrada del caso de prueba' 
  })
  @IsString()
  input!: string;

  @ApiProperty({ 
    example: '0 1', 
    description: 'Salida esperada del caso de prueba' 
  })
  @IsString()
  output!: string;

  @ApiProperty({ 
    example: true, 
    description: 'Si el caso de prueba es visible para el usuario',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

// DTO para crear un reto
export class CreateChallengeDto {
  @ApiProperty({ 
    example: 'Two Sum', 
    description: 'Título del reto' 
  })
  @IsString()
  title!: string;

  @ApiProperty({ 
    example: 'Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target.\n\nInput:\n- Primera línea: los números del array separados por espacio.\n- Segunda línea: el valor target.\n\nOutput:\n- Los dos índices separados por espacio (orden ascendente).', 
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
  difficulty?: Difficulty;

  @ApiProperty({ 
    example: ['arrays', 'hash-table'], 
    description: 'Etiquetas temáticas del reto',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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
    description: 'ID del autor que crea el reto (se extrae automáticamente del token JWT)',
    required: false
  })
  @IsOptional()
  @IsString()
  authorId?: string;

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

  @ApiProperty({ 
    type: [CreateTestCaseDto],
    example: [
      { caseNumber: 1, input: '5 3', output: '8', visible: true },
      { caseNumber: 2, input: '10 20', output: '30', visible: false }
    ], 
    description: 'Casos de prueba del reto',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  testcases?: CreateTestCaseDto[];
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

  @ApiProperty({ 
    required: false,
    description: 'Código de solución de referencia'
  })
  @IsOptional()
  @IsString()
  solutionCode?: string;

  @ApiProperty({ 
    required: false,
    description: 'Lenguaje del código de solución (python, javascript, cpp, java)'
  })
  @IsOptional()
  @IsString()
  solutionLanguage?: string;
}
