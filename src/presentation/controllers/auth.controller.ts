import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
  UsePipes,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupRequest, LoginRequest } from '../../application/dtos/auth.dto';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, HASHER_REPOSITORY } from '../../application/tokens';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { HasherRepository } from '../../domain/repositories/hasher.repository';
import { SignupUseCase } from 'src/application/usesCases/user/signup.usecase';
import { LoginUseCase } from 'src/application/usesCases/user/login.usecase';
import { AuthGuard } from '@nestjs/passport';

// 👇 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

class AuthTokensDoc {
  access: string;
  refresh: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    @Inject(USER_REPOSITORY) private readonly usersRepo: UserRepository,
    @Inject(HASHER_REPOSITORY) private readonly hasher: HasherRepository,
  ) {}

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('signup')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({
    type: SignupRequest,
    examples: {
      student: {
        summary: 'Registro de Estudiante',
        value: { 
          email: 'estudiante@universidad.edu',
          password: 'Estudiante123!',
          name: 'María García',
          code: 'EST2025001',
          username: 'maria.garcia',
          role: 'STUDENT'
        },
      },
      professor: {
        summary: 'Registro de Profesor',
        value: { 
          email: 'profesor@universidad.edu',
          password: 'Profesor456!',
          name: 'Dr. Carlos Ruiz',
          code: 'PROF2025001',
          username: 'carlos.ruiz',
          role: 'PROFESSOR'
        },
      },
      admin: {
        summary: 'Registro de Administrador',
        value: { 
          email: 'admin@universidad.edu',
          password: 'Admin789!',
          name: 'Ana Pérez',
          code: 'ADM2025001',
          username: 'ana.perez',
          role: 'ADMIN'
        },
      }
    },
  })
  @ApiCreatedResponse({
    description: 'Usuario creado y tokens firmados',
    type: AuthTokensDoc,
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async signup(@Body() dto: SignupRequest) {
     try {
      const uc = new SignupUseCase(this.usersRepo, this.hasher, () => crypto.randomUUID());
      const user = await uc.execute({
          email: dto.email, 
          password: dto.password,
          name: dto.name,
          code: dto.code,
          username: dto.username,
          role: dto.role
      });
      return this.signTokens(user.id, user.role); 
    } 
    catch (err: any){
      throw new InternalServerErrorException(err?.message ?? 'Internal server error');
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiBody({
    type: LoginRequest,
    examples: {
      student: {
        summary: 'Login de Estudiante',
        value: { email: 'estudiante@universidad.edu', password: 'Estudiante123!' },
      },
      professor: {
        summary: 'Login de Profesor',
        value: { email: 'profesor@universidad.edu', password: 'Profesor456!' },
      },
      admin: {
        summary: 'Login de Administrador',
        value: { email: 'admin@universidad.edu', password: 'Admin789!' },
      },
    },
  })
  @ApiOkResponse({ 
    description: 'Login exitoso', 
    type: AuthTokensDoc,
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async login(@Body() dto: LoginRequest) {
    const uc = new LoginUseCase(this.usersRepo, this.hasher);
    try {
      const user = await uc.execute({ email: dto.email, password: dto.password });
      return this.signTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar tokens',
    description:
      'Requiere un **Refresh Token** válido (por header Authorization: Bearer <refresh>).',
  })
  
  // Si en tu configuración de Swagger definiste dos bearerAuth (p. ej. "access" y "refresh"),
  // puedes especificar el nombre aquí. Si no, deja el default:
  @ApiBearerAuth('refresh') // cámbialo a 'Authorization' o tu nombre de esquema si corresponde
  @ApiOkResponse({ 
    description: 'Tokens renovados', 
    type: AuthTokensDoc,
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido o expirado' })
  async refresh(@Req() req: any) {
    return this.signTokens(req.user.userId, req.user.role);
  }

  private async signTokens(userId: string, role: string) {
    const payload: Record<string, any> = { 
      sub: userId, 
      role: role
    };
    
    const [access, refresh] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET, 
        expiresIn: '15m'
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET, 
        expiresIn: '7d'
      }),
    ]);
    return { access, refresh };
  }
    
}