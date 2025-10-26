import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { CreateCourseUseCase } from '../../application/usesCases/course/createcourse.usecase';
import { FindCourseByNrcUseCase } from '../../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../../application/usesCases/course/deletecourse.usecase';
import { CreateCourseDTO } from '../../application/dtos/course';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly createCourse: CreateCourseUseCase,
    private readonly findCourse: FindCourseByNrcUseCase,
    private readonly getAllCourses: FindAllCoursesUseCase,
    private readonly updateCourse: UpdateCourseUseCase,
    private readonly deleteCourse: DeleteCourseUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCourseDTO) {
    return this.createCourse.execute(dto);
  }

  @Get()
  async findAll() {
    return this.getAllCourses.execute();
  }

  @Get(':nrc')
  async findOne(@Param('nrc') nrc: string) {
    return this.findCourse.execute(nrc);
  }

  @Put(':nrc')
  async update(@Param('nrc') nrc: string, @Body() dto: any) {
    return this.updateCourse.execute(nrc, dto);
  }

  @Delete(':nrc')
  async remove(@Param('nrc') nrc: string) {
    return this.deleteCourse.execute(nrc);
  }
}
