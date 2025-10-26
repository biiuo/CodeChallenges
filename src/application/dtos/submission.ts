// DTO para crear un envío (submission)
export class CreateSubmissionDto {
  // @IsString()
  language!: string;

  // @IsString()
  code!: string;

  // @IsInt()
  userId!: number;

  // @IsInt()
  challengeId!: number;
}

// DTO para actualizar el estado de un envío
export class UpdateSubmissionStatusDto {
  // @IsEnum(SubmissionStatus)
  status!: string;

  // @IsOptional() @IsInt()
  score?: number;

  // @IsOptional() @IsInt()
  timeMsTotal?: number;
}
