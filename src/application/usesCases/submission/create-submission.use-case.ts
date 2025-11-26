import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma.service';
import { SubmissionQueueService } from 'src/infrastructure/queue/submission-queue.service';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';
import { SubmissionStatus } from '@prisma/client';

export interface CreateSubmissionInput {
  userId: string;
  challengeId: string;
  language: string;
  code: string;
  courseId?: string;
  evaluationId?: number;
}

const SUPPORTED_LANGUAGES = ['python', 'node', 'cpp', 'java', 'javascript', 'c++'];

@Injectable()
export class CreateSubmissionUseCase {
  private readonly logger = new Logger(CreateSubmissionUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: SubmissionQueueService,
    private readonly observability: ObservabilityService,
  ) {}

  async execute(input: CreateSubmissionInput) {
    console.log('🔍 [CreateSubmissionUseCase] CALLED with:', JSON.stringify(input));
    
    // 1. Validaciones básicas
    await this.validateInput(input);

    // 2. Calcular submissionNumber
    const submissionNumber = await this.getNextSubmissionNumber(input);

    // 3. Crear submission en DB con status QUEUED
    const submission = await this.prisma.submission.create({
      data: {
        userId: input.userId,
        challengeId: input.challengeId,
        language: this.normalizeLanguage(input.language),
        code: input.code,
        courseId: input.courseId,
        evaluationId: input.evaluationId,
        submissionNumber,
        status: SubmissionStatus.QUEUED,
        score: null,
        timeMsTotal: null,
      },
    });

    this.logger.log(
      `✅ Submission ${submission.id} created: userId=${input.userId}, challenge=${input.challengeId}, lang=${submission.language}`,
    );

    // 📊 OBSERVABILITY: Submission created
    this.observability.submissionCreated(
      submission.id,
      input.userId,
      input.challengeId,
      submission.language,
    );

    // 4. Encolar para procesamiento
    console.log(`🔍 [CreateSubmissionUseCase] About to enqueue submission ${submission.id}`);
    const enqueued = await this.queue.enqueueSubmission({
      submissionId: submission.id,
      userId: input.userId,
      challengeId: input.challengeId,
      language: submission.language,
      code: input.code,
    });

    console.log(`🔍 [CreateSubmissionUseCase] Enqueue result: ${enqueued}`);

    if (!enqueued) {
      console.error(`❌ [CreateSubmissionUseCase] Failed to enqueue submission ${submission.id}`);
      this.logger.error(`⚠️ Failed to enqueue submission ${submission.id}, but it was created in DB`);
    } else {
      console.log(`✅ [CreateSubmissionUseCase] Successfully enqueued submission ${submission.id}`);
      // 📊 OBSERVABILITY: Submission enqueued
      this.observability.submissionEnqueued(submission.id, 'submission.queue');
    }

    // 5. Retornar entidad creada
    return submission;
  }

  /**
   * Valida que el challenge existe, el usuario existe y el lenguaje es soportado
   */
  private async validateInput(input: CreateSubmissionInput): Promise<void> {
    // Validar challenge existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: input.challengeId },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge ${input.challengeId} not found`);
    }

    // Validar usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${input.userId} not found`);
    }

    // Validar lenguaje soportado
    const normalized = this.normalizeLanguage(input.language);
    if (!SUPPORTED_LANGUAGES.includes(normalized)) {
      throw new BadRequestException(
        `Language '${input.language}' not supported. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
      );
    }

    // Validar código no vacío
    if (!input.code || input.code.trim().length === 0) {
      throw new BadRequestException('Code cannot be empty');
    }
  }

  /**
   * Calcula el siguiente número de submission para este usuario y challenge
   */
  private async getNextSubmissionNumber(input: CreateSubmissionInput): Promise<number> {
    const last = await this.prisma.submission.findFirst({
      where: {
        userId: input.userId,
        challengeId: input.challengeId,
        courseId: input.courseId,
        evaluationId: input.evaluationId,
      },
      orderBy: { submissionNumber: 'desc' },
    });

    return last ? last.submissionNumber + 1 : 1;
  }

  /**
   * Normaliza el nombre del lenguaje
   */
  private normalizeLanguage(lang: string): string {
    const normalized = lang.toLowerCase().trim();
    const mapping: Record<string, string> = {
      python: 'python',
      python3: 'python',
      py: 'python',
      node: 'node',
      nodejs: 'node',
      javascript: 'node',
      js: 'node',
      cpp: 'cpp',
      'c++': 'cpp',
      java: 'java',
    };

    return mapping[normalized] || normalized;
  }
}
