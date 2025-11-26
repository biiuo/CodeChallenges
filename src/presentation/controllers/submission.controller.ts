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
import { ProcessSubmissionUseCase } from 'src/application/usesCases/submission/process-submission.use-case';
import { PrismaSubmissionRepository } from 'src/infrastructure/repositories/prisma-submission.repository';
import { PrismaChallengeRepository } from 'src/infrastructure/repositories/prisma-challenge.repository';
import { Submission, SubmissionStatus } from 'src/domain/entities/submission.entity';
import { CreateSubmissionDto, SubmissionResponseDto } from 'src/application/dtos/submission';

export interface CreateSubmissionDTO {
  code: string;
  language: string;
  challengeId: string;
}

@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionController {
  constructor(
    private readonly processSubmissionUseCase: ProcessSubmissionUseCase,
    private readonly submissionRepo: PrismaSubmissionRepository,
    private readonly testcaseRepo: PrismaChallengeRepository,
  ) {}

  /**
   * Create a new submission (save in DB with status QUEUED)
   * POST /submissions
   */  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar solución de un reto' })
  @ApiBody({
    type: CreateSubmissionDto,
    examples: {
      pythonHelloWorld: {
        summary: 'Python - Hello World',
        value: {
          code: 'print("Hello World")',
          language: 'python',
          challengeId: 'CH-ABCDE'
        }
      },
      javascriptTwoSum: {
        summary: 'JavaScript - Two Sum',
        value: {
          code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
          language: 'javascript',
          challengeId: 'CH-TWOSUM'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Submission creado exitosamente',
    type: SubmissionResponseDto,
    schema: {
      example: {
        id: 123,
        userId: '00001111-2222-3333-4444-555566667777',
        challengeId: 'CH-ABCDE',
        code: 'print("Hello World")',
        language: 'python',
        status: 'QUEUED',
        score: 0,
        timeMsTotal: 0,
        createdAt: '2025-11-25T23:45:30.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Challenge no encontrado' })
  async createSubmission(
    @Body() dto: CreateSubmissionDTO,
    @Request() req: any,
  ): Promise<Submission> {
    const userId = req.user.userId;

    // Save submission to DB with QUEUED status
    const submission = await this.submissionRepo.create({
      userId,
      challengeId: dto.challengeId,
      code: dto.code,
      language: dto.language,
      status: SubmissionStatus.QUEUED,
    });


    return submission;
  }

  /**
   * Get a specific submission by ID
   * GET /submissions/:id
   */
  @Get(':id')
  async getSubmission(@Param('id', ParseIntPipe) submissionId: number): Promise<Submission> {
    const submission = await this.submissionRepo.findById(submissionId);

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    return submission;
  }

  /**
   * List all submissions for the current user
   * GET /submissions
   */
  @Get()
  async listSubmissions(@Request() req: any): Promise<Submission[]> {
    const userId = req.user.userId;
    return this.submissionRepo.findByUser(userId);
  }

}
