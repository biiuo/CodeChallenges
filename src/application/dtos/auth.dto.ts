import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupRequest {
  @ApiProperty({ example: 'estudiante@universidad.edu', description: 'Correo electrónico del usuario' })
  @IsEmail() 
  email!: string;

  @ApiProperty({ example: 'MiPassword123!', description: 'Contraseña (mínimo 6 caracteres)', minLength: 6 })
  @IsString() 
  @MinLength(6) 
  password!: string;

  @ApiProperty({ example: 'María García', description: 'Nombre completo del usuario' })
  @IsString() 
  name!: string;

  @ApiProperty({ example: 'maria.garcia', description: 'Nombre de usuario único' })
  @IsString() 
  username!: string;

  @ApiProperty({ example: 'STUDENT', description: 'Rol del usuario (default: STUDENT)', enum: ['STUDENT', 'PROFESSOR', 'ADMIN'], required: false })
  @IsString()
  @IsOptional()
  role?: string;
}

export class LoginRequest {
  @ApiProperty({ example: 'estudiante@universidad.edu', description: 'Correo electrónico' })
  @IsEmail() 
  email!: string;

  @ApiProperty({ example: 'MiPassword123!', description: 'Contraseña', minLength: 6 })
  @IsString() 
  @MinLength(6) 
  password!: string;
}

export class TokenResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token de acceso JWT' })
  access!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token de refresco JWT' })
  refresh!: string;
}
