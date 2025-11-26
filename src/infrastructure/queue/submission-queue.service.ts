import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface SubmissionJob {
  submissionId: number;
  userId: string;
  challengeId: string;
  language: string;
  code: string;
}

@Injectable()
export class SubmissionQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubmissionQueueService.name);
  private redis: Redis;
  private readonly QUEUE_KEY = 'submission.queue';

  async onModuleInit() {
    // Conectar a Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'redispass',
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Connected to Redis for submission queue');
    });

    this.redis.on('error', (err) => {
      this.logger.error('❌ Redis connection error:', err);
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Encola un submission para ser procesado por un worker
   * @param job - Datos del submission
   * @returns true si se encoló exitosamente
   */
  async enqueueSubmission(job: SubmissionJob): Promise<boolean> {
    try {
      const jobData = JSON.stringify(job);
      
      // RPUSH: agregar al final de la cola
      await this.redis.rpush(this.QUEUE_KEY, jobData);
      
      this.logger.log(`📤 Submission ${job.submissionId} enqueued (userId: ${job.userId}, challenge: ${job.challengeId}, lang: ${job.language})`);
      
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to enqueue submission ${job.submissionId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene el siguiente job de la cola (bloqueante)
   * @param timeout - Timeout en segundos (0 = bloqueante indefinido)
   * @returns Job o null si timeout
   */
  async dequeueSubmission(timeout: number = 0): Promise<SubmissionJob | null> {
    try {
      // BLPOP: obtener del inicio de la cola (bloqueante)
      const result = await this.redis.blpop(this.QUEUE_KEY, timeout);
      
      if (!result) {
        return null; // Timeout alcanzado
      }

      const [, jobData] = result;
      const job: SubmissionJob = JSON.parse(jobData);
      
      this.logger.log(`📥 Submission ${job.submissionId} dequeued`);
      
      return job;
    } catch (error) {
      this.logger.error('❌ Failed to dequeue submission:', error);
      return null;
    }
  }

  /**
   * Obtiene el tamaño actual de la cola
   */
  async getQueueSize(): Promise<number> {
    return await this.redis.llen(this.QUEUE_KEY);
  }
}
