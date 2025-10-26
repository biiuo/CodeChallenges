import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateChallengeDto } from '../../application/dtos/challenges';
import { UpdateChallengeDto } from '../../application/dtos/challenges';
import { CreateChallengeUseCase } from '../../application/usesCases/challenge/createchallenge.usecase';
import { FindChallengeByIdUseCase } from '../../application/usesCases/challenge/findchallengebyid.usecase';
import { FindAllChallengesUseCase } from '../../application/usesCases/challenge/findallchallenges.usecase';
import { UpdateChallengeUseCase } from '../../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../../application/usesCases/challenge/deletechallenge.usecase';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly getChallengeByIdUseCase: FindChallengeByIdUseCase,
    private readonly getAllChallengesUseCase: FindAllChallengesUseCase,
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
  ) {}

  // POST /challenges
  @Post()
  async create(@Body() data: CreateChallengeDto) {
    return await this.createChallengeUseCase.execute(data);
  }

  // GET /challenges
  @Get()
  async findAll() {
    return await this.getAllChallengesUseCase.execute();
  }

  // GET /challenges/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.getChallengeByIdUseCase.execute(id);
  }

  // PUT /challenges/:id
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateChallengeDto,
  ) {
    return await this.updateChallengeUseCase.execute(id, data);
  }

  // DELETE /challenges/:id
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.deleteChallengeUseCase.execute(id);
  }
}
