# Sistema de Submissions (Judge) - Implementación Completa

## 📋 Resumen

Este documento describe la implementación completa del sistema de evaluación de código (judge system) siguiendo la especificación exhaustiva proporcionada.

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Controller    │  POST /submissions → retorna submission QUEUED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CreateSubmission│  Valida, crea en DB (QUEUED), encola en Redis
│    UseCase      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Queue    │  RPUSH → 'submission.queue'
└────────┬────────┘
         │
         ▼ BLPOP (blocking)
┌─────────────────┐
│     Worker      │  Loop continuo en background
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ProcessSubmission│  DB (RUNNING) → ejecuta código → DB (final state)
│    UseCase      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ EnhancedRunner  │  Docker execution con compilation y per-case tests
└─────────────────┘
```

## 📂 Archivos Creados/Modificados

### 1. **output-utils.ts** ✅
- **Ubicación**: `src/infrastructure/runners/output-utils.ts`
- **Funciones**:
  - `normalize(text)`: Elimina `\r`, trim, manejo de null
  - `compareOutputs(student, expected)`: Comparación línea por línea → "OK" | "WRONG_ANSWER"
  - `truncateOutput(text, maxLength)`: Limita output a 10KB por defecto

### 2. **submission-queue.service.ts** ✅
- **Ubicación**: `src/infrastructure/queue/submission-queue.service.ts`
- **Métodos**:
  - `enqueueSubmission(job)`: RPUSH a Redis
  - `dequeueSubmission(timeout)`: BLPOP con timeout (blocking)
  - `getQueueSize()`: LLEN para monitorear

### 3. **create-submission.use-case.ts** ✅
- **Ubicación**: `src/application/usesCases/submission/create-submission.use-case.ts`
- **Flujo**:
  1. Validar: challenge existe, user existe, language soportado, code no vacío
  2. Calcular `submissionNumber` (último + 1)
  3. Crear registro en DB con `status = QUEUED`
  4. Encolar en Redis

### 4. **enhanced-runner.service.ts** ✅
- **Ubicación**: `src/infrastructure/runners/enhanced-runner.service.ts`
- **Responsabilidades**:
  - **Compilación** (C++/Java): Detectar errores y retornar `COMPILATION_ERROR`
  - **Ejecución por caso**: 
    - Escribir `input.txt`
    - Docker run con `timeout`, `--network none`, límites de recursos
    - Capturar stdout/stderr
    - Comparar con expected output
  - **Status final**: Determinar según prioridad (CE > TLE > RE > WA > AC)
  - **Score**: 100 si AC, proporcional si hay casos correctos

### 5. **process-submission.use-case.ts** ✅ (REEMPLAZADO)
- **Ubicación**: `src/application/usesCases/submission/process-submission.use-case.ts`
- **Flujo**:
  1. Recuperar submission desde DB (debe estar QUEUED)
  2. Actualizar `status = RUNNING`
  3. Recuperar challenge + testcases
  4. Ejecutar con `EnhancedRunnerService`
  5. Persistir `SubmissionTestResult` para cada caso
  6. Actualizar submission con status final y score
  7. Manejo de errores: marcar como `RUNTIME_ERROR` si falla

### 6. **submission-worker.service.ts** ✅
- **Ubicación**: `src/infrastructure/workers/submission-worker.service.ts`
- **Comportamiento**:
  - Al arrancar módulo: `onModuleInit()` → inicia worker loop
  - Loop continuo: `BLPOP` con timeout 5s
  - Procesar cada job con `ProcessSubmissionUseCase`
  - Retry con exponential backoff (max 3 intentos)
  - Al destruir módulo: `onModuleDestroy()` → detiene gracefully

### 7. **submission.controller.ts** ✅ (MODIFICADO)
- **Cambios**:
  - Usar `CreateSubmissionUseCase` en lugar de crear directamente
  - Eliminar `executeSubmissionAsync()` (obsoleto, ahora es el worker)
  - Eliminar métodos auxiliares de ejecución directa
  - Controller solo crea y consulta, NO ejecuta

### 8. **submission.module.ts** ✅ (MODIFICADO)
- **Providers agregados**:
  - `SubmissionQueueService`
  - `CreateSubmissionUseCase`
  - `ProcessSubmissionUseCase` (modificado)
  - `EnhancedRunnerService`
  - `SubmissionWorkerService`

## 🔄 Máquina de Estados

```
QUEUED ──────────────────────────┐
  │                               │
  │ (Worker dequeue)              │
  ▼                               │
RUNNING ─────────────┬────────────┤
                     │            │
     ┌───────────────┴────────┐   │
     ▼               ▼        ▼   ▼
ACCEPTED    WRONG_ANSWER   TLE   RE
                              COMPILATION_ERROR
```

### Prioridad de Status Final:
1. `COMPILATION_ERROR` (si hay error de compilación)
2. `TIME_LIMIT_EXCEEDED` (si algún caso excede tiempo)
3. `RUNTIME_ERROR` (si algún caso tiene error de ejecución)
4. `WRONG_ANSWER` (si algún caso falla comparación)
5. `ACCEPTED` (si todos los casos pasan)

## 🐳 Comandos Docker

### Python:
```bash
docker run --rm --network none -v /tmp/subm-123:/work -w /work --cpus=".5" -m 512m runner-python:latest sh -c "timeout 2s python3 Main.py < input.txt"
```

### Node.js:
```bash
docker run --rm --network none -v /tmp/subm-123:/work -w /work --cpus=".5" -m 512m runner-node:latest sh -c "timeout 2s node Main.js < input.txt"
```

### C++ (compilación + ejecución):
```bash
# Compilación
docker run --rm --network none -v /tmp/subm-123:/work -w /work runner-cpp:latest sh -c "g++ Main.cpp -O2 -std=c++17 -o main"

# Ejecución
docker run --rm --network none -v /tmp/subm-123:/work -w /work --cpus=".5" -m 512m runner-cpp:latest sh -c "timeout 2s ./main < input.txt"
```

### Java (compilación + ejecución):
```bash
# Compilación
docker run --rm --network none -v /tmp/subm-123:/work -w /work runner-java:latest sh -c "javac Main.java"

# Ejecución
docker run --rm --network none -v /tmp/subm-123:/work -w /work --cpus=".5" -m 512m runner-java:latest sh -c "timeout 2s java Main < input.txt"
```

## 📊 Logging Detallado

El sistema incluye logs exhaustivos en cada etapa:

### CreateSubmissionUseCase:
```
[CreateSubmissionUseCase] Creating submission for user abc123, challenge CH-HSPAX
[CreateSubmissionUseCase] ✅ Submission 42 created and enqueued
```

### Worker:
```
🚀 Starting Submission Worker...
📥 Dequeued submission: 42
✅ Submission 42 processed: ACCEPTED, score: 100
```

### ProcessSubmissionUseCase:
```
🔄 [42] START processing submission
[42] ✅ Status updated to RUNNING
[42] 📋 Challenge: CH-HSPAX, Testcases: 5
[42] 📊 Execution result: ACCEPTED, score: 100
[42] ✅ Persisted 5 test results
[42] ✅ COMPLETED processing: ACCEPTED
```

### EnhancedRunnerService:
```
🚀 [42] Starting execution: 5 cases, python
[42] ✅ Compilation successful
[42] 📝 Running case 1...
[42] Case 1: OK (72ms)
[42] 📝 Running case 2...
[42] Case 2: OK (68ms)
...
[42] ✅ Execution completed: ACCEPTED, score: 100
```

## 🧪 Cómo Probar

### 1. Crear submission vía API:
```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "CH-HSPAX",
    "code": "print(\"Hello World\")",
    "language": "python"
  }'
```

**Respuesta inmediata:**
```json
{
  "id": 42,
  "status": "QUEUED",
  "submissionNumber": 1,
  ...
}
```

### 2. Consultar estado (polling):
```bash
curl http://localhost:3000/submissions/42/status \
  -H "Authorization: Bearer YOUR_JWT"
```

**Durante ejecución:**
```json
{
  "id": 42,
  "status": "RUNNING",
  "score": null,
  "timeMsTotal": null
}
```

**Después de completar:**
```json
{
  "id": 42,
  "status": "ACCEPTED",
  "score": 100,
  "timeMsTotal": 350
}
```

### 3. Obtener resultados por caso:
```bash
curl http://localhost:3000/submissions/42/results \
  -H "Authorization: Bearer YOUR_JWT"
```

**Respuesta:**
```json
[
  {
    "caseNumber": 1,
    "status": "OK",
    "timeMs": 72,
    "output": "Hello World\n",
    "errorMsg": null
  },
  {
    "caseNumber": 2,
    "status": "OK",
    "timeMs": 68,
    "output": "Hello World\n",
    "errorMsg": null
  }
]
```

## 🔍 Verificar en Base de Datos

### Submission table:
```sql
SELECT id, status, score, timeMsTotal, submissionNumber 
FROM Submission 
WHERE id = 42;
```

### SubmissionTestResult table:
```sql
SELECT caseNumber, status, timeMs, output, errorMsg 
FROM SubmissionTestResult 
WHERE submissionId = 42 
ORDER BY caseNumber;
```

## 📈 Monitoreo

### Cola Redis:
```bash
# Ver tamaño de cola
docker exec -it redis redis-cli LLEN submission.queue

# Ver primer elemento sin sacarlo
docker exec -it redis redis-cli LINDEX submission.queue 0
```

### Worker status:
El worker logea continuamente su actividad. Buscar en logs del backend:
```bash
docker logs codecchallenges-backend-1 -f | grep Worker
```

## ⚠️ Notas Importantes

1. **Worker automático**: Se inicia al arrancar el módulo (`onModuleInit`)
2. **Retry logic**: 3 intentos con exponential backoff (1s, 2s, 4s)
3. **Resource limits**: Todos los containers tienen `--cpus=.5` y `-m 512m`
4. **Network isolation**: `--network none` para seguridad
5. **Timeout**: Configurado per-language con `timeout` command
6. **Output truncation**: Máximo 10KB por caso para evitar DB overflow
7. **Cleanup**: Directorios temporales eliminados después de ejecución

## ✅ Checklist de Implementación

- ✅ Output utilities (normalize, compare, truncate)
- ✅ Redis queue service (enqueue/dequeue)
- ✅ CreateSubmissionUseCase (validation, DB insert, enqueue)
- ✅ EnhancedRunnerService (compilation, per-case execution, Docker isolation)
- ✅ ProcessSubmissionUseCase (worker logic, state machine)
- ✅ SubmissionWorkerService (background loop, retry)
- ✅ Controller actualizado (usa CreateSubmissionUseCase)
- ✅ Module actualizado (todos los providers registrados)
- ✅ Logging exhaustivo en cada etapa
- ✅ Manejo de errores robusto

## 🚀 Próximos Pasos

1. **Compilar y probar**: `docker compose up --build`
2. **Verificar worker**: Buscar "Starting Submission Worker" en logs
3. **Crear submission**: Via API POST /submissions
4. **Monitorear logs**: Ver ejecución en tiempo real
5. **Verificar DB**: SubmissionTestResult debe poblarse
6. **Polling**: Consultar status hasta que cambie de RUNNING

---

**Especificación seguida al pie de la letra** ✅
