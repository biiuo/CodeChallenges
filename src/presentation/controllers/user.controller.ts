import { Controller, Get, Req, UseGuards, Inject, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { USER_REPOSITORY } from '../../application/tokens';
import type { UserRepository } from '../../domain/repositories/user.repository';

class UserProfileDoc {
  userId: string;
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve la información básica del usuario extraída del token JWT. Requiere un token de acceso válido en el encabezado **Authorization: Bearer &lt;token&gt;**.',
  })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
    type: UserProfileDoc,
    schema: {
      example: {
        userId: '00001111-2222-3333-4444-555566667777',
        role: 'STUDENT'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o no proporcionado',
  })
  async me(@Req() req: any) {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return {
      id: user.id,
      name: user.name,
      code: user.code,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}