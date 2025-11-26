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
import { ProcessSubmissionDTO } from 'src/application/usesCases/submission/process-submission.use-case';
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

    // Auto-execute (async, could be moved to Bull Queue in production)
    // Fire-and-forget execution to not block response
    this.executeSubmissionAsync(submission.id, dto.code, dto.language, dto.challengeId).catch(
      (err) => console.error(`Failed to execute submission ${submission.id}:`, err),
    );

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

  /**
   * Manually trigger execution of a submission
   * POST /submissions/:id/execute
   */
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  async executeSubmissionRoute(@Param('id', ParseIntPipe) submissionId: number): Promise<any> {
    const submission = await this.submissionRepo.findById(submissionId);

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    return this.executeSubmissionAsync(
      submissionId,
      submission.code,
      submission.language,
      submission.challengeId,
    );
  }

  /**
   * Private helper: Execute submission with runner (async)
   */
  private async executeSubmissionAsync(
    submissionId: number,
    code: string,
    language: string,
    challengeId: string,
  ): Promise<any> {
    // Mark submission as RUNNING
    await this.submissionRepo.update(submissionId, {
      status: SubmissionStatus.RUNNING,
    });

    // Get test cases for the challenge
    // TODO: Implement via ChallengeRepository to fetch actual test cases
    const testCases = await this.getTestCasesForChallenge(challengeId);

    if (!testCases || testCases.length === 0) {
      console.warn(`No test cases found for challenge ${challengeId}`);
      return;
    }

    const dto: ProcessSubmissionDTO = {
      submissionId: submissionId.toString(),
      code,
      language,
      testCases,
      timeLimit: 1500,
    };

    try {
      const result = await this.processSubmissionUseCase.execute(dto);

      // Update submission in DB with result
      await this.submissionRepo.update(submissionId, {
        status: result.status as any,
        score: result.score,
        timeMsTotal: result.totalTimeMs,
      });

      return result;
    } catch (err) {
      console.error(`Error executing submission ${submissionId}:`, err);

      // Mark as error
      await this.submissionRepo.update(submissionId, {
        status: SubmissionStatus.RUNTIME_ERROR,
        score: 0,
      });

      throw err;
    }
  }

  /**
   * Private helper: Get test cases for a challenge
   * Fetches from database via TestCaseRepository
   */
  private async getTestCasesForChallenge(
    challengeId: string,
  ): Promise<Array<{ id: number; input: string; output: string }>> {
    try {
      const challenge = await this.testcaseRepo.findById(challengeId);
      if (!challenge || !challenge.testCases || challenge.testCases.length === 0) {
      
        console.warn(`No test cases found for challenge ${challengeId}`);
        return [];
      }

      return challenge.testCases.map((tc) => ({
        id: tc.caseNumber,
        input: tc.input,
        output: tc.output,
      }));
    } catch (err) {
      console.error(`Error fetching test cases for challenge ${challengeId}:`, err);
      return [];
    }
  }
}
