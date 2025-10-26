import { ChallengeStatus, Difficulty } from "src/domain/entities/challenge.entity";

// DTO para crear un reto
export class CreateChallengeDto {
  // @IsString()
  title!: string;

  // @IsString()
  description!: string;

  // @IsEnum(Difficulty)
  difficulty!: Difficulty |null;

  // @IsArray()
  tags!: string[];

  // @IsInt()
  timeLimit!: number;

  // @IsInt()
  memoryLimit!: number;

  // @IsInt()
  courseId!: number;
  // @IsEnum(ChallengeStatus)
  status?: string;
}

// DTO para actualizar un reto
export class UpdateChallengeDto {
  title?: string;
  description?: string;
  difficulty?: Difficulty | null;
  tags?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  status?: ChallengeStatus
  coursenrc?: string;
}
