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

  /**
   * Create a new submission (save in DB with status QUEUED)
   * POST /submissions
   */
  @Post()
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
      pythonTwoSum: {
        summary: 'Python - Two Sum',
        value: {
          code: 'import sys\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\ndef main():\n    lines = sys.stdin.read().strip().split("\\n")\n    if len(lines) < 2: return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    result = two_sum(nums, target)\n    result.sort()\n    print(f"{result[0]} {result[1]}")\n\nif __name__ == "__main__":\n    main()',
          language: 'python',
          challengeId: 'CH-TWOSUM'
        }
      },
      javascriptTwoSum: {
        summary: 'JavaScript - Two Sum',
        value: {
          code: 'const fs = require("fs");\n\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nfunction main() {\n  const input = fs.readFileSync(0, "utf-8").trim().split("\\n");\n  if (input.length < 2) return;\n  const nums = input[0].trim().split(/\\s+/).map(Number);\n  const target = Number(input[1].trim());\n  \n  const result = twoSum(nums, target);\n  result.sort((a, b) => a - b);\n  console.log(`${result[0]} ${result[1]}`);\n}\n\nmain();',
          language: 'javascript',
          challengeId: 'CH-TWOSUM'
        }
      },
      pythonFibonacci: {
        summary: 'Python - Fibonacci',
        value: {
          code: 'import sys\n\ndef fib(n):\n    if n < 0: return -1\n    if n == 0: return 0\n    if n == 1: return 1\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\ndef main():\n    try:\n        line = sys.stdin.read().strip()\n        if not line: return\n        n = int(line)\n        print(fib(n))\n    except ValueError:\n        pass\n\nif __name__ == "__main__":\n    main()',
          language: 'python',
          challengeId: 'CH-FIBONACCI'
        }
      },
      javascriptFibonacci: {
        summary: 'JavaScript - Fibonacci',
        value: {
          code: 'const fs = require("fs");\n\nfunction fib(n) {\n  if (n < 0) return -1;\n  if (n === 0) return 0;\n  if (n === 1) return 1;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    let temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}\n\nfunction main() {\n  const input = fs.readFileSync(0, "utf-8").trim();\n  if (!input) return;\n  const n = parseInt(input, 10);\n  if (isNaN(n)) return;\n  console.log(fib(n));\n}\n\nmain();',
          language: 'javascript',
          challengeId: 'CH-FIBONACCI'
        }
      },
      cppHelloWorld: {
        summary: 'C++ - Hello World',
        value: {
          code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}',
          language: 'cpp',
          challengeId: 'CH-ABCDE'
        }
      },
      cppTwoSum: {
        summary: 'C++ - Two Sum',
        value: {
          code: '#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <sstream>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    string line1, line2;\n    if (!getline(cin, line1) || !getline(cin, line2)) return 0;\n\n    stringstream ss(line1);\n    int num;\n    vector<int> nums;\n    while (ss >> num) {\n        nums.push_back(num);\n    }\n\n    int target = stoi(line2);\n    unordered_map<int, int> seen;\n\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) {\n            int idx1 = seen[complement];\n            int idx2 = i;\n            if (idx1 > idx2) swap(idx1, idx2);\n            cout << idx1 << " " << idx2 << endl;\n            return 0;\n        }\n        seen[nums[i]] = i;\n    }\n    return 0;\n}',
          language: 'cpp',
          challengeId: 'CH-TWOSUM'
        }
      },
      cppFibonacci: {
        summary: 'C++ - Fibonacci',
        value: {
          code: '#include <iostream>\nusing namespace std;\n\nlong long fib(int n) {\n    if (n < 0) return -1;\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    long long a = 0, b = 1;\n    for (int i = 2; i <= n; ++i) {\n        long long temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << fib(n) << endl;\n    }\n    return 0;\n}',
          language: 'cpp',
          challengeId: 'CH-FIBONACCI'
        }
      },
      javaHelloWorld: {
        summary: 'Java - Hello World',
        value: {
          code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
          language: 'java',
          challengeId: 'CH-ABCDE'
        }
      },
      javaTwoSum: {
        summary: 'Java - Two Sum',
        value: {
          code: 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 == null || line2 == null) return;\n        String[] parts = line1.trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i]);\n        }\n        int target = Integer.parseInt(line2.trim());\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) {\n                int idx1 = seen.get(complement);\n                int idx2 = i;\n                if (idx1 > idx2) { int temp = idx1; idx1 = idx2; idx2 = temp; }\n                System.out.println(idx1 + " " + idx2);\n                return;\n            }\n            seen.put(nums[i], i);\n        }\n    }\n}',
          language: 'java',
          challengeId: 'CH-TWOSUM'
        }
      },
      javaFibonacci: {
        summary: 'Java - Fibonacci',
        value: {
          code: 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        System.out.println(fib(n));\n    }\n    \n    private static long fib(int n) {\n        if (n < 0) return -1;\n        if (n == 0) return 0;\n        if (n == 1) return 1;\n        long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n}',
          language: 'java',
          challengeId: 'CH-FIBONACCI'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Submission creado exitosamente. La ejecución ha iniciado en background.',
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
    @Body() dto: CreateSubmissionDto | undefined,
    @Request() req: any,
  ): Promise<Submission> {
    console.log('🔍 [Controller] createSubmission method CALLED');
    
    // Fallback: si dto es undefined, intentar usar req.body directamente
    const submissionData = dto || req.body;
    
    console.log(`🔍 [Controller] Received data: ${JSON.stringify(submissionData)}`);
    
    this.logger.debug('DEBUG - DTO received:' + JSON.stringify(dto));
    this.logger.debug('DEBUG - Request body:' + JSON.stringify(req.body));
    this.logger.debug('DEBUG - Submission data:' + JSON.stringify(submissionData));
    this.logger.debug('DEBUG - User:' + JSON.stringify(req.user));
    
    if (!submissionData) {
      throw new Error(`No submission data received. DTO: ${JSON.stringify(dto)}, Body: ${JSON.stringify(req.body)}`);
    }
    
    const { challengeId, code, language } = submissionData;
    
    if (!challengeId || !code || !language) {
      throw new Error(`Missing required fields. Received: ${JSON.stringify(submissionData)}`);
    }

    const userId = req.user.userId;

    console.log(`🔍 [Controller] About to call CreateSubmissionUseCase for user ${userId}`);

    // Usar el nuevo CreateSubmissionUseCase (valida, crea en DB, encola en Redis)
    const submission = await this.createSubmissionUseCase.execute({
      userId,
      challengeId,
      code,
      language,
      courseId: undefined, // Opcional
      evaluationId: undefined, // Opcional
    });

    console.log(`🔍 [Controller] UseCase returned submission ${submission.id}`);

    this.logger.log(`✅ Submission ${submission.id} created and queued`);

    // El worker procesará automáticamente el submission desde la cola Redis

    // Mapear el resultado de Prisma a la entidad Submission del dominio
      return {
        ...submission,
        status: (submission as any).status as SubmissionStatus,
        score: (submission as any).score ?? undefined,
        timeMsTotal: (submission as any).timeMsTotal ?? undefined,
      } as Submission;
  }

  /**
   * Get a specific submission by ID
   * GET /submissions/:id
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener submission por ID',
    description: `Obtiene los detalles completos de un submission específico.

**Casos de uso:**
- Consultar el estado de un submission después de crearlo
- Obtener los resultados finales (puntaje, tiempo de ejecución)
- Revisar el código enviado

**Estados posibles:**
- \`QUEUED\`: En cola para ejecución
- \`RUNNING\`: Ejecutándose actualmente
- \`ACCEPTED\`: Todos los casos de prueba pasaron ✅
- \`WRONG_ANSWER\`: Al menos un caso falló ❌
- \`TIME_LIMIT_EXCEEDED\`: Excedió el tiempo límite ⏱️
- \`MEMORY_LIMIT_EXCEEDED\`: Excedió el límite de memoria 💾
- \`RUNTIME_ERROR\`: Error durante la ejecución 🔴
- \`COMPILATION_ERROR\`: Error de compilación (C++, Java) 🔧`
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID numérico del submission', 
    example: 123,
    type: Number
  })
  @ApiOkResponse({ 
    description: '✅ Submission encontrado exitosamente',
    type: SubmissionResponseDto
  })
  
  @ApiNotFoundResponse({ description: '❌ Submission no encontrado - el ID no existe' })
  async getSubmission(@Param('id', ParseIntPipe) submissionId: number): Promise<Submission> {
    const submission = await this.submissionRepo.findById(submissionId);

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    return submission;
  }

  /**
   * Get per-test-case results for a submission
   * GET /submissions/:id/results
   */
  @Get(':id/results')
  @ApiOperation({ summary: 'Obtener resultados por caso de prueba' })
  @ApiOkResponse({ description: 'Lista de resultados por caso' })
  @ApiNotFoundResponse({ description: 'Submission no encontrado' })
  async getSubmissionResults(@Param('id', ParseIntPipe) submissionId: number): Promise<any[]> {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    return this.submissionRepo.getTestResults(submissionId);
  }

  /**
   * List all submissions for the current user
   * GET /submissions
   */
  @Get()
  @ApiOperation({ 
    summary: 'Listar submissions del usuario',
    description: `Lista todos los submissions del usuario autenticado, ordenados por fecha de creación (más recientes primero).

**Información incluida:**
- Historial completo de submissions
- Estado actual de cada submission
- Puntaje obtenido
- Tiempo de ejecución
- Lenguaje utilizado

**Nota:** Solo retorna los submissions del usuario autenticado (basado en el token JWT).`
  })
  @ApiOkResponse({ 
    description: '✅ Lista de submissions obtenida exitosamente',
    type: [SubmissionResponseDto],
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: 125,
          userId: '00001111-2222-3333-4444-555566667777',
          challengeId: 'CH-TWOSUM',
          language: 'python',
          status: 'ACCEPTED',
          score: 100,
          timeMsTotal: 145,
          createdAt: '2025-11-25T23:50:15.000Z'
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Re-ejecutar submission manualmente',
    description: `Ejecuta manualmente un submission existente. 

**Casos de uso:**
- Re-evaluar un submission después de actualizar los casos de prueba
- Depurar la ejecución de un submission
- Forzar la ejecución de un submission que quedó en estado QUEUED

**Nota:** Este endpoint espera a que la ejecución finalice antes de responder (puede tardar varios segundos).`
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID numérico del submission a re-ejecutar', 
    example: 123,
    type: Number
  })
  @ApiOkResponse({ 
    description: 'Resultado detallado de la ejecución con información de cada caso de prueba',
    schema: {
      example: {
        status: 'ACCEPTED',
        score: 100,
        totalTimeMs: 145,
        cases: [
          {
            caseId: 1,
            caseNumber: 1,
            status: 'PASSED',
            timeMsElapsed: 72,
            input: '[2,7,11,15]\n9',
            expectedOutput: '[0,1]',
            actualOutput: '[0,1]',
            visible: true
          },
          {
            caseId: 2,
            caseNumber: 2,
            status: 'PASSED',
            timeMsElapsed: 73,
            input: '[3,2,4]\n6',
            expectedOutput: '[1,2]',
            actualOutput: '[1,2]',
            visible: false
          }
        ]
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Submission no encontrado' })
  async executeSubmissionRoute(@Param('id', ParseIntPipe) submissionId: number): Promise<any> {
    const submission = await this.submissionRepo.findById(submissionId);

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    // Do NOT trigger execution on GET. Only return submission details.
    // Execution is initiated on POST /submissions (QUEUED -> RUNNING -> final state)
    return submission;
  }

  /**
   * Get observability metrics
   * GET /submissions/metrics
   */
  @Get('metrics/json') // Changed path to avoid conflict with :id param
  @ApiOperation({
    summary: 'Obtener métricas del sistema de submissions',
    description: 'Retorna métricas JSON sobre submissions procesadas, tiempos de ejecución, runners activos, etc.',
  })
  @ApiOkResponse({
    description: 'Métricas del sistema',
    schema: {
      type: 'object',
      properties: {
        submissions_total: { type: 'number', description: 'Total de submissions procesadas' },
        submissions_accepted: { type: 'number', description: 'Submissions aceptadas (AC)' },
        submissions_wrong_answer: { type: 'number', description: 'Submissions con respuesta incorrecta' },
        submissions_time_limit_exceeded: { type: 'number', description: 'Submissions con TLE' },
        submissions_runtime_error: { type: 'number', description: 'Submissions con error de ejecución' },
        submissions_compilation_error: { type: 'number', description: 'Submissions con error de compilación' },
        submissions_failed_total: { type: 'number', description: 'Total de submissions fallidas' },
        average_execution_time_ms: { type: 'number', description: 'Tiempo promedio de ejecución (ms)' },
        active_runners: { type: 'number', description: 'Runners actualmente ejecutándose' },
      },
    },
  })
  async getMetrics(): Promise<any> {
    return await this.observability.getMetricsJson();
  }
}