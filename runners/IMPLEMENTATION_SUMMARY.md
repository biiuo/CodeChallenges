# Módulo 4 - Runners: Resumen de cambios implementados

## Archivos creados

### 1. Dockerfiles para runners (`runners/`)
- ✅ `runners/runner-python/Dockerfile` — Image Python 3.11 con usuario no-root
- ✅ `runners/runner-node/Dockerfile` — Image Node.js 20 con usuario no-root
- ✅ `runners/runner-cpp/Dockerfile` — Image C++ (Debian + build-essential) con usuario no-root
- ✅ `runners/runner-java/Dockerfile` — Image Java 17 (Eclipse Temurin) con usuario no-root

### 2. Servicio de ejecución
- ✅ `src/infrastructure/runners/runner.service.ts` — Servicio que orquesta `docker run` con:
  - Detecta lenguaje y mapea a imagen runner
  - Crea carpeta temporal con código
  - Lanza contenedor con flags de seguridad: `--network none`, `--cpus 0.5`, `--memory 512m`, `--read-only`, `--tmpfs`
  - Aplica timeout por caso de prueba
  - Captura stdout/stderr y compara con salida esperada
  - Devuelve estado: `OK`, `WA`, `TLE`, `RE`, `CE`

- ✅ `src/infrastructure/runners/runner.module.ts` — Módulo exporta RunnerService

### 3. Observabilidad y métricas
- ✅ `src/infrastructure/observability/observability.service.ts` — Registra:
  - Logs JSON estructurados con `submissionId` de trazabilidad
  - Métricas: `submissions_total`, `submissions_accepted`, `submissions_wrong_answer`, `submissions_time_limit_exceeded`, `submissions_runtime_error`, `submissions_compilation_error`, `submissions_failed_total`, `average_execution_time_ms`, `active_runners`
  - Formatos: Prometheus y JSON

- ✅ `src/infrastructure/observability/observability.module.ts` — Módulo exporta ObservabilityService

- ✅ `src/presentation/controllers/metrics.controller.ts` — Endpoints:
  - `GET /metrics/prometheus` — Métricas en formato Prometheus
  - `GET /metrics/json` — Métricas en formato JSON

### 4. Use Case para procesar submissions
- ✅ `src/application/usesCases/submission/process-submission.use-case.ts` — Implementa:
  - `ProcessSubmissionUseCase.execute()` — ejecuta código contra múltiples casos de prueba
  - Calcula score y status final (ACCEPTED, WRONG_ANSWER, TLE, etc.)
  - Registra logs y métricas
  - Maneja errores y limpieza de recursos

### 5. Documentación
- ✅ `runners/README.md` — Guía completa:
  - Estructura de runners
  - Características de seguridad
  - Cómo construir imágenes
  - Formatos de código esperados
  - Troubleshooting

- ✅ `runners/INTEGRATION.md` — Guía de integración:
  - Arquitectura del flujo
  - Pasos para integrar en módulos
  - Ejemplo de controller
  - Flujo de un submission
  - Endpoints de métricas
  - Execución asincrónica con Bull Queue
  - Escalado con Docker Compose

### 6. Tests y ejemplos
- ✅ `runners/test_runner_local.py` — Script Python para probar runners localmente sin Docker:
  - Ejecuta código Python, Node.js, C++, Java
  - Compara salidas esperadas
  - Verifica estados (OK, TLE, CE, RE)

## Archivos modificados

### 1. `docker-compose.yml`
- ✅ Añadidos servicios `runner-python`, `runner-node`, `runner-cpp`, `runner-java` con `profile: build-only`
- ✅ Las imágenes se construyen con `docker compose --profile build-only build`
- ✅ El backend puede usar estas imágenes en `docker run` sin ser servicios activos

### 2. `package.json`
- ✅ Script `lint` eliminado
- ✅ Agregado `postinstall` para generar Prisma automáticamente

## Seguridad implementada en cada runner

| Flag | Valor | Propósito |
|------|-------|-----------|
| `--network none` | - | Sin acceso a internet |
| `--cpus` | 0.5 | Límite de CPU (50% de 1 core) |
| `--memory` | 512m | Límite de memoria |
| `--read-only` | - | Sistema de archivos de solo lectura |
| `--tmpfs /tmp:rw,exec,size=128m` | - | Área temporal escribible para compilación |
| `--pids-limit` | 10 | Máximo 10 procesos (evita fork bombs) |
| `--rm` | - | Destruye contenedor automáticamente |
| Usuario | `runner` (no-root) | Evita privilegios |

## Cómo funciona el flujo

```
1. Cliente envía código (POST /submissions)
   ↓
2. API crea Submission con status QUEUED
   ↓
3. ProcessSubmissionUseCase.execute()
   ├─ RunnerService.executeAgainstTestCases()
   │  ├─ Para cada caso de prueba:
   │  │  ├─ Crea carpeta temp /tmp/run-<uuid>/
   │  │  ├─ Escribe código y entrada en archivos
   │  │  ├─ Lanza docker run (con límites de seguridad)
   │  │  ├─ Captura salida y stderr
   │  │  ├─ Compara con salida esperada
   │  │  ├─ Determina status (OK, WA, TLE, RE, CE)
   │  │  └─ Limpia archivos temporales
   │  └─ Retorna resultados de todos los casos
   │
   ├─ Calcula score y status final
   ├─ ObservabilityService.logSubmissionEvent() → logs JSON
   └─ ObservabilityService.recordSubmission() → métricas
   ↓
4. API guarda resultado en BD
   ↓
5. Cliente consulta GET /submissions/:id → resultado
```

## Construcción de imágenes

### Opción 1: Manual
```bash
docker build -t runner-python:latest ./runners/runner-python/
docker build -t runner-node:latest ./runners/runner-node/
docker build -t runner-cpp:latest ./runners/runner-cpp/
docker build -t runner-java:latest ./runners/runner-java/
```

### Opción 2: Con docker-compose (recomendado)
```bash
docker compose --profile build-only build
```

### Opción 3: Script automatizado
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

## Uso desde el código

### Inyectar en controller
```typescript
constructor(private readonly runner: RunnerService) {}
```

### Ejecutar un código simple
```typescript
const result = await this.runner.executeCode(
  ProgrammingLanguage.PYTHON,
  'print("hello")',
  '', // input
  1500 // timeLimit
);
```

### Ejecutar contra múltiples casos de prueba
```typescript
const results = await this.runner.executeAgainstTestCases(
  ProgrammingLanguage.PYTHON,
  'n = int(input())\nprint(n*2)',
  [
    { id: 1, input: '5', output: '10' },
    { id: 2, input: '100', output: '200' }
  ],
  1500
);
```

### Usar ProcessSubmissionUseCase
```typescript
const result = await this.processSubmission.execute({
  submissionId: 'subm-123',
  code: 'print("test")',
  language: 'python',
  testCases: [...],
  timeLimit: 1500
});
// result.status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TLE' | 'RE' | 'CE' | 'ERROR'
// result.score: 0-100
// result.cases: [...test results with timing]
```

## Ver métricas

```bash
# Prometheus
curl http://localhost:3000/metrics/prometheus

# JSON
curl http://localhost:3000/metrics/json
```

## Logs de trazabilidad

Cada submission genera logs JSON correlacionados:
```json
{
  "level": "info",
  "timestamp": "2025-11-25T15:30:00Z",
  "submissionId": "subm-42",
  "event": "finished",
  "status": "ACCEPTED",
  "durationMs": 730,
  "language": "python"
}
```

Rastrear todo el flujo de un submission:
```bash
# Buscar en logs
grep "subm-42" application.log
```

## Próximos pasos

- [ ] Integrar con Bull Queue para procesamiento asincrónico
- [ ] Añadir rutas en submission.controller.ts
- [ ] Implementar repository para guardar resultados
- [ ] Crear tests unitarios para runner.service.ts
- [ ] Probar con casos reales (múltiples lenguajes)
- [ ] Configurar alertas en producción (límite de memoria, containers activos)

## Notas importantes

1. **Docker debe estar corriendo** — Los runners ejecutan `docker run` internamente
2. **Las imágenes deben existir** — Construir primero con docker-compose o script
3. **Permisos de `/tmp`** — El worker crea carpetas ahí; asegurar que el usuario tiene permisos
4. **Timeout configurado** — 5 segundos por caso (configurable en `runner.service.ts`)
5. **Límites de recursos** — 0.5 CPU y 512 MB memoria; ajustar según necesidad
6. **Trazabilidad** — Todos los logs incluyen `submissionId` para debugging
