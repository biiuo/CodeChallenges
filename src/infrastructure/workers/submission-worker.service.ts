import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SubmissionQueueService } from '../queue/submission-queue.service';
import { ProcessSubmissionUseCase } from '../../application/usesCases/submission/process-submission.use-case';
import { ObservabilityService } from '../observability/observability.service';

/**
 * Worker Service: Consumidor continuo de la cola Redis
 * 
 * Comportamiento:
 * - Al arrancar el módulo, inicia un worker loop en background
 * - BLPOP blocking con timeout de 5 segundos
 * - Procesa cada submission usando ProcessSubmissionUseCase
 * - Manejo de errores: log y continuar (no detener el worker)
 * - Al destruir el módulo, detiene el loop gracefully
 */
@Injectable()
export class SubmissionWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubmissionWorkerService.name);
  private isRunning = false;
  private workerPromise: Promise<void> | null = null;

  constructor(
    private readonly queue: SubmissionQueueService,
    private readonly processSubmission: ProcessSubmissionUseCase,
    private readonly observability: ObservabilityService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Starting Submission Worker...');
    this.isRunning = true;
    this.workerPromise = this.workerLoop();
    
    // Iniciar limpieza periódica de contenedores (cada 5 minutos)
    this.startPeriodicCleanup();
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Stopping Submission Worker...');
    this.isRunning = false;

    // Esperar a que termine el worker loop
    if (this.workerPromise) {
      await this.workerPromise;
    }

    this.logger.log('✅ Submission Worker stopped');
  }

  /**
   * Loop principal del worker
   * Itera continuamente mientras isRunning = true
   */
  private async workerLoop(): Promise<void> {
    console.log('🔍 [Worker] Loop started, waiting for jobs...');
    while (this.isRunning) {
      try {
        // Dequeue con timeout de 5 segundos (blocking)
        const job = await this.queue.dequeueSubmission(5);

        if (!job) {
          // Timeout alcanzado sin jobs, continuar
          console.log('🔍 [Worker] No job in queue, waiting...');
          continue;
        }
        
        console.log(`🔍 [Worker] Job received: ${JSON.stringify(job)}`);

        this.logger.log(`📥 Dequeued submission: ${job.submissionId}`);

        // 📊 OBSERVABILITY: Submission dequeued
        this.observability.submissionDequeued(job.submissionId);

        // Procesar submission
        await this.processSubmissionWithRetry(job.submissionId);

      } catch (error) {
        this.logger.error('❌ Worker loop error:', error);
        // Esperar un poco antes de reintentar para evitar loop infinito en caso de error persistente
        await this.sleep(1000);
      }
    }

    this.logger.log('Worker loop finished');
  }

  /**
   * Procesar submission con retry en caso de error
   */
  private async processSubmissionWithRetry(submissionId: number, maxRetries = 3): Promise<void> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const result = await this.processSubmission.execute({ submissionId });
        
        this.logger.log(`✅ Submission ${submissionId} processed: ${result.status}, score: ${result.score}`);

        // 📊 OBSERVABILITY: Record metrics
        await this.observability.recordSubmission(result.status);
        await this.observability.recordExecutionTime(result.timeMsTotal);

        return; // Éxito, salir

      } catch (error) {
        attempt++;
        this.logger.error(`❌ Submission ${submissionId} failed (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          // Esperar antes de reintentar (exponential backoff)
          const delayMs = Math.pow(2, attempt) * 1000;
          this.logger.log(`⏳ Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs);
        } else {
          this.logger.error(`❌ Submission ${submissionId} failed after ${maxRetries} attempts. Giving up.`);
        }
      }
    }
  }

  /**
   * Utilidad para esperar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpieza periódica de contenedores huérfanos
   */
  private startPeriodicCleanup(): void {
    const cleanupInterval = 5 * 60 * 1000; // 5 minutos
    
    const cleanup = async () => {
      if (!this.isRunning) return;
      
      try {
        this.logger.log('🧹 Running periodic container cleanup...');
        
        // Eliminar contenedores detenidos
        await this.exec('docker container prune -f').catch(() => {});
        
        // Matar contenedores colgados de nuestras imágenes runner
        const images = ['runner-python:latest', 'runner-node:latest', 'runner-cpp:latest', 'runner-java:latest'];
        
        for (const image of images) {
          const { stdout } = await this.exec(`docker ps -q --filter ancestor=${image}`).catch(() => ({ stdout: '' }));
          const containerIds = stdout.trim().split('\n').filter(id => id.length > 0);
          
          if (containerIds.length > 0) {
            this.logger.warn(`🧹 Found ${containerIds.length} hanging containers for ${image}, killing...`);
            await Promise.all(
              containerIds.map(id => this.exec(`docker kill ${id}`).catch(() => {}))
            );
          }
        }
        
        this.logger.log('✅ Periodic cleanup completed');
      } catch (error) {
        this.logger.error('❌ Periodic cleanup error:', error);
      }
      
      // Programar siguiente limpieza
      if (this.isRunning) {
        setTimeout(cleanup, cleanupInterval);
      }
    };
    
    // Iniciar primera limpieza después de 30 segundos
    setTimeout(cleanup, 30000);
  }

  /**
   * Ejecutar comando shell (helper)
   */
  private exec(command: string): Promise<{ stdout: string; stderr: string }> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);
    return execPromise(command, { timeout: 5000 });
  }

  /**
   * Método público para obtener el estado del worker
   */
  getStatus(): { isRunning: boolean; queueSize: number } {
    return {
      isRunning: this.isRunning,
      queueSize: 0, // TODO: implementar si es necesario
    };
  }
}
