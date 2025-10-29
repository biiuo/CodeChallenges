import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/usesCases/user/createuser.usecase';
import { FindUserByIdUseCase } from '../../application/usesCases/user/getuser.usecase';
import { UpdateUserUseCase  } from '../../application/usesCases/user/updateuser.usecase';
import { DeleteUserUseCase } from '../../application/usesCases/user/deleteuser.usecase'
import { RegisterDTO } from '../../application/dtos/user';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly findUser: FindUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    return this.createUser.execute(dto);
  }

@Get(':id')
  async findById(@Param('id') id: string) {
    return this.findUser.execute(id);
  }

 

  @Put(':codigo')
  async update(@Param('codigo') codigo: string, @Body() data: Partial<RegisterDTO>) {
    return this.updateUser.execute(codigo, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteUser.execute(id);
  }
}
