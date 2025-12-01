# Integración de Runners con el Backend

Este documento describe cómo integrar el servicio `RunnerService` en los módulos de la aplicación.

## Arquitectura

```
API Request (POST /submissions)
    ↓
SubmissionController
    ↓
ProcessSubmissionUseCase
    ↓
RunnerService (ejecuta en Docker)
    ↓
SubmissionRepository (guarda resultado)
    ↓
ObservabilityService (logs + métricas)
```

## Pasos de integración

### 1. Importar módulos en `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RunnerModule } from 'src/infrastructure/runners/runner.module';
import { ObservabilityModule } from 'src/infrastructure/observability/observability.module';

@Module({
  imports: [
    // ... otros módulos
    RunnerModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
```

### 2. Usar en Submission Module

```typescript
import { Module } from '@nestjs/common';
import { RunnerModule } from 'src/infrastructure/runners/runner.module';
import { ObservabilityModule } from 'src/infrastructure/observability/observability.module';
import { SubmissionController } from 'src/presentation/controllers/submission.controller';
import { ProcessSubmissionUseCase } from 'src/application/usesCases/submission/process-submission.use-case';

@Module({
  imports: [RunnerModule, ObservabilityModule],
  controllers: [SubmissionController],
  providers: [ProcessSubmissionUseCase],
})
export class SubmissionModule {}
```

### 3. Usar en Controller

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ProcessSubmissionUseCase } from 'src/application/usesCases/submission/process-submission.use-case';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly processSubmission: ProcessSubmissionUseCase) {}

  @Post('execute')
  async executeSubmission(@Body() dto) {
    const result = await this.processSubmission.execute({
      submissionId: 'subm-123',
      code: 'print("hello")',
      language: 'python',
      testCases: [
        { id: 1, input: '', output: 'hello\n' }
      ],
      timeLimit: 1500,
    });
    return result;
  }
}
```

## Flujo de un submission

### 1. Recibir submission
```typescript
POST /submissions
{
  "code": "n = int(input())\nprint(n*2)",
  "language": "python",
  "challengeId": "ch-1",
  "userId": "user-1"
}
```

### 2. Guardar estado inicial (QUEUED)
```typescript
const submission = await submissionRepo.create({
  userId: 'user-1',
  challengeId: 'ch-1',
  code,
  language: 'python',
  status: 'QUEUED',
});
```

### 3. Encolar en Redis (Optional - para worker async)
```typescript
await this.queue.add('execute-submission', {
  submissionId: submission.id,
  code,
  language: 'python',
  testCases: [...],
});
```

### 4. Procesar (Worker o sync)
```typescript
const result = await processSubmissionUseCase.execute({
  submissionId: submission.id,
  code,
  language: 'python',
  testCases: [...],
  timeLimit: 1500,
});
```

### 5. Guardar resultado
```typescript
await submissionRepo.update(submission.id, {
  status: result.status,
  score: result.score,
  totalTimeMs: result.totalTimeMs,
  cases: result.cases,
});
```

### 6. Devolver resultado al cliente
```typescript
{
  "id": "subm-123",
  "status": "ACCEPTED",
  "score": 100,
  "totalTimeMs": 145,
  "cases": [
    {
      "caseId": 1,
      "status": "OK",
      "timeMsElapsed": 45,
      "expectedOutput": "10",
      "actualOutput": "10"
    }
  ]
}
```

## Obtener métricas

### Endpoint Prometheus
```bash
curl http://localhost:3000/metrics/prometheus
```

Respuesta:
```
# HELP submissions_total Total number of submissions processed
# TYPE submissions_total counter
submissions_total 42

# HELP average_execution_time_ms Average execution time in milliseconds
# TYPE average_execution_time_ms gauge
average_execution_time_ms 523.45

# HELP active_runners Current number of active runner containers
# TYPE active_runners gauge
active_runners 0
```

### Endpoint JSON
```bash
curl http://localhost:3000/metrics/json
```

Respuesta:
```json
{
  "submissions_total": 42,
  "submissions_accepted": 38,
  "submissions_wrong_answer": 3,
  "submissions_time_limit_exceeded": 1,
  "submissions_runtime_error": 0,
  "submissions_compilation_error": 0,
  "submissions_failed_total": 0,
  "average_execution_time_ms": 523.45,
  "active_runners": 0
}
```

## Logs de trazabilidad

Cada ejecución genera logs JSON con `submissionId` como ID de seguimiento:

```json
{
  "timestamp": "2025-11-25T15:30:00Z",
  "level": "info",
  "msg": "Runner finished execution",
  "submissionId": "subm-42",
  "status": "ACCEPTED",
  "durationMs": 730
}
```

Todos los logs para un mismo submission pueden buscarse por `submissionId`:
```bash
grep "subm-42" logs.json
```

## Ejecución asincrónica con Bull Queue

Para procesar submissions de forma asincrónica usando Bull Queue (Redis):

### 1. Instalar Bull
```bash
npm install @nestjs/bull bull
```

### 2. Crear procesador
```typescript
import { Processor, Process } from '@nestjs/bull';
import { ProcessSubmissionUseCase } from 'src/application/usesCases/submission/process-submission.use-case';

@Processor('submissions')
export class SubmissionProcessor {
  constructor(private readonly processSubmission: ProcessSubmissionUseCase) {}

  @Process('execute')
  async handleSubmissionExecution(job) {
    return await this.processSubmission.execute(job.data);
  }
}
```

### 3. Encolar desde controller
```typescript
@Post()
async submit(@Body() dto) {
  const submission = await this.submissionRepo.create(dto);
  
  await this.submissionQueue.add('execute', {
    submissionId: submission.id,
    code: dto.code,
    language: dto.language,
    testCases: dto.testCases,
    timeLimit: dto.timeLimit,
  });

  return { id: submission.id, status: 'QUEUED' };
}
```

## Escalado con Docker Compose

Para ejecutar múltiples workers:

```bash
docker compose up -d backend
docker compose up -d --scale worker=3
```

Cada worker:
- Lee jobs de Redis
- Ejecuta `ProcessSubmissionUseCase`
- Lanza contenedores runner
- Guarda resultados

## Troubleshooting

### Error: "Docker daemon not running"
Inicia Docker Desktop o el servicio Docker.

### Error: "runner-python:latest not found"
Construye las imágenes:
```bash
docker compose --profile build-only build
```

### TLE en todos los casos
- Verifica que el código no tiene loop infinito
- Aumenta `timeLimit`
- Revisa logs del runner container

### Memory Limit Exceeded
- Aumenta `--memory` en `runner.service.ts`
- Optimiza el algoritmo para usar menos memoria

## Performance tips

- Mantén las imágenes runner pequeñas (sin herramientas innecesarias)
- Usa `--tmpfs` en lugar de volúmenes para temp files
- Ejecuta múltiples workers en paralelo
- Cachea casos de prueba en Redis
- Considera pre-compilar lenguajes interpretados
