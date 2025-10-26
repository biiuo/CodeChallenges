/*
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateSubmissionDto, UpdateSubmissionDto } from 'src/application/dtos/submission.dto';
import { CreateSubmissionUseCase } from '../../application/useCases/submission/create-submission.usecase';
import { GetSubmissionUseCase } from '../../application/useCases/submissions/getsubmission.usecase';
import { ListSubmissionsUseCase } from '../../application/useCases/submission/list-submission.usecase';
import { UpdateSubmissionUseCase } from '/application/useCases/submission/update-submission.usecase';

@Controller('submissions')
export class SubmissionController {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
    private readonly listSubmissionsUseCase: ListSubmissionsUseCase,
    private readonly updateSubmissionUseCase: UpdateSubmissionUseCase,
  ) {}

  @Post()
  async create(@Body() data: CreateSubmissionDto) {
    return this.createSubmissionUseCase.execute(data);
  }

  @Get()
  async findAll() {
    return this.listSubmissionsUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getSubmissionUseCase.execute(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateSubmissionDto) {
    return this.updateSubmissionUseCase.execute(id, data);
  }
}
*/