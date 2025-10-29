import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

class UserProfileDoc {
  id: string;
  email: string;
  roles: string[];
}


@ApiTags('Users')
@ApiBearerAuth('access')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {

  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve la información básica del usuario extraída del token JWT. Requiere un token de acceso válido en el encabezado **Authorization: Bearer &lt;token&gt;**.',
  })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
    type: UserProfileDoc,
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o no proporcionado',
  })
  me(@Req() req: any) {
    return req.user;
  }
}