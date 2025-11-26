// Force reload v3
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateSubmissionUseCase } from 'src/application/usesCases/submission/create-submission.use-case';
import { PrismaSubmissionRepository } from 'src/infrastructure/repositories/prisma-submission.repository';
import { PrismaChallengeRepository } from 'src/infrastructure/repositories/prisma-challenge.repository';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';
import { Submission, SubmissionStatus } from 'src/domain/entities/submission.entity';
import { CreateSubmissionDto, SubmissionResponseDto } from 'src/application/dtos/submission';

@ApiTags('Submissions')
@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access')
@ApiUnauthorizedResponse({ description: 'Token JWT inválido o faltante' })
export class SubmissionController {
  private readonly logger = new Logger(SubmissionController.name);

  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly submissionRepo: PrismaSubmissionRepository,
    private readonly challengeRepo: PrismaChallengeRepository,
    private readonly observability: ObservabilityService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar solución de un reto' })
  @ApiCreatedResponse({ description: 'Submission creado', type: SubmissionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Challenge no encontrado' })
  async createSubmission(
    @Body() dto: CreateSubmissionDto,
    @Request() req: any,
  ): Promise<Submission> {
    console.log('🔍 [Controller] createSubmission CALLED');
    console.log('🔍 [Controller] DTO:', JSON.stringify(dto));
    
    const userId = req.user.userId;
    console.log(`🔍 [Controller] UserId: ${userId}`);

    const submission = await this.createSubmissionUseCase.execute({
      userId,
      challengeId: dto.challengeId,
      code: dto.code,
      language: dto.language,
      courseId: undefined,
      evaluationId: undefined,
    });

    console.log(`🔍 [Controller] Submission created: ${submission.id}`);
    return submission;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener submission por ID' })
  async getSubmission(@Param('id', ParseIntPipe) submissionId: number): Promise<Submission> {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    return submission;
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Obtener resultados por caso de prueba' })
  async getSubmissionResults(@Param('id', ParseIntPipe) submissionId: number): Promise<any[]> {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    return this.submissionRepo.getTestResults(submissionId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar submissions del usuario' })
  async listSubmissions(@Request() req: any): Promise<Submission[]> {
    const userId = req.user.userId;
    return this.submissionRepo.findByUser(userId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas del sistema' })
  getMetrics(): any {
    return this.observability.getMetricsJson();
  }
}
