"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubmissionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const create_submission_use_case_1 = require("../../application/usesCases/submission/create-submission.use-case");
const prisma_submission_repository_1 = require("../../infrastructure/repositories/prisma-submission.repository");
const prisma_challenge_repository_1 = require("../../infrastructure/repositories/prisma-challenge.repository");
const observability_service_1 = require("../../infrastructure/observability/observability.service");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const submission_1 = require("../../application/dtos/submission");
const submission_mapper_1 = require("../../infrastructure/mappers/submission.mapper");
let SubmissionController = SubmissionController_1 = class SubmissionController {
    createSubmissionUseCase;
    submissionRepo;
    challengeRepo;
    observability;
    prisma;
    logger = new common_1.Logger(SubmissionController_1.name);
    constructor(createSubmissionUseCase, submissionRepo, challengeRepo, observability, prisma) {
        this.createSubmissionUseCase = createSubmissionUseCase;
        this.submissionRepo = submissionRepo;
        this.challengeRepo = challengeRepo;
        this.observability = observability;
        this.prisma = prisma;
    }
    async createSubmission(dto, req) {
        console.log('🔍 [Controller] createSubmission method CALLED');
        const submissionData = dto || req.body;
        console.log(`🔍 [Controller] Received data: ${JSON.stringify(submissionData)}`);
        this.logger.debug('DEBUG - DTO received:' + JSON.stringify(dto));
        this.logger.debug('DEBUG - Request body:' + JSON.stringify(req.body));
        this.logger.debug('DEBUG - Submission data:' + JSON.stringify(submissionData));
        this.logger.debug('DEBUG - User:' + JSON.stringify(req.user));
        if (!submissionData) {
            throw new Error(`No submission data received. DTO: ${JSON.stringify(dto)}, Body: ${JSON.stringify(req.body)}`);
        }
        const { challengeId, code, language, courseId, evaluationId } = submissionData;
        if (!challengeId || !code || !language) {
            throw new Error(`Missing required fields. Received: ${JSON.stringify(submissionData)}`);
        }
        const userId = req.user.userId;
        console.log(`🔍 [Controller] About to call CreateSubmissionUseCase for user ${userId}, courseId: ${courseId}`);
        const submission = await this.createSubmissionUseCase.execute({
            userId,
            challengeId,
            code,
            language,
            courseId: courseId || undefined,
            evaluationId: evaluationId ? parseInt(evaluationId, 10) : undefined,
        });
        console.log(`🔍 [Controller] UseCase returned submission ${submission.id}`);
        this.logger.log(`✅ Submission ${submission.id} created and queued`);
        return {
            ...submission,
            status: submission.status,
            score: submission.score ?? undefined,
            timeMsTotal: submission.timeMsTotal ?? undefined,
        };
    }
    async getSubmission(submissionId) {
        const submission = await this.submissionRepo.findById(submissionId);
        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }
        return submission;
    }
    async getSubmissionResults(submissionId) {
        const submission = await this.submissionRepo.findById(submissionId);
        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }
        return this.submissionRepo.getTestResults(submissionId);
    }
    async listSubmissions(req, filterUserId, courseId, challengeId, status, language, evaluationId) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const where = {};
        if (courseId) {
            where.courseId = courseId;
        }
        if (challengeId) {
            where.challengeId = challengeId;
        }
        if (status) {
            where.status = status;
        }
        if (language) {
            where.language = language;
        }
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId, 10);
        }
        if (userRole === 'STUDENT') {
            where.userId = userId;
            const results = await this.prisma.submission.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            return results.map(submission_mapper_1.SubmissionMapper.toDomain);
        }
        if (filterUserId) {
            where.userId = filterUserId;
        }
        const results = await this.prisma.submission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return results.map(submission_mapper_1.SubmissionMapper.toDomain);
    }
    async executeSubmissionRoute(submissionId) {
        const submission = await this.submissionRepo.findById(submissionId);
        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }
        return submission;
    }
    async getMetrics() {
        return await this.observability.getMetricsJson();
    }
};
exports.SubmissionController = SubmissionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar solución de un reto' }),
    (0, swagger_1.ApiBody)({
        type: submission_1.CreateSubmissionDto,
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
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Submission creado exitosamente. La ejecución ha iniciado en background.',
        type: submission_1.SubmissionResponseDto,
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
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Datos inválidos' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Challenge no encontrado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "createSubmission", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID numérico del submission',
        example: 123,
        type: Number
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '✅ Submission encontrado exitosamente',
        type: submission_1.SubmissionResponseDto
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: '❌ Submission no encontrado - el ID no existe' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resultados por caso de prueba' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de resultados por caso' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Submission no encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionResults", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar submissions del usuario',
        description: `Lista submissions según el rol del usuario autenticado, ordenados por fecha de creación (más recientes primero).

**Roles y permisos:**
- **STUDENT**: Solo ve sus propios submissions. Puede filtrar por courseId, challengeId, status, language.
- **PROFESSOR**: Ve todos los submissions. Puede filtrar por userId, courseId, challengeId, status, language.
- **ADMIN**: Ve todos los submissions. Puede filtrar por userId, courseId, challengeId, status, language.

**Filtros disponibles:**
- \`courseId\`: Filtrar por curso
- \`userId\`: Filtrar por usuario (solo PROFESSOR/ADMIN)
- \`challengeId\`: Filtrar por reto
- \`status\`: Filtrar por estado (QUEUED, RUNNING, ACCEPTED, etc.)
- \`language\`: Filtrar por lenguaje (python, javascript, cpp, java)
- \`evaluationId\`: Filtrar por evaluación

**Información incluida:**
- Historial completo de submissions
- Estado actual de cada submission
- Puntaje obtenido
- Tiempo de ejecución
- Lenguaje utilizado`
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '✅ Lista de submissions obtenida exitosamente',
        type: [submission_1.SubmissionResponseDto],
        schema: {
            type: 'array',
            items: {
                type: 'object',
                example: {
                    id: 125,
                    userId: '00001111-2222-3333-4444-555566667777',
                    challengeId: 'CH-TWOSUM',
                    courseId: 'course-123',
                    language: 'python',
                    status: 'ACCEPTED',
                    score: 100,
                    timeMsTotal: 145,
                    createdAt: '2025-11-25T23:50:15.000Z'
                }
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('courseId')),
    __param(3, (0, common_1.Query)('challengeId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('language')),
    __param(6, (0, common_1.Query)('evaluationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "listSubmissions", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Re-ejecutar submission manualmente',
        description: `Ejecuta manualmente un submission existente. 

**Casos de uso:**
- Re-evaluar un submission después de actualizar los casos de prueba
- Depurar la ejecución de un submission
- Forzar la ejecución de un submission que quedó en estado QUEUED

**Nota:** Este endpoint espera a que la ejecución finalice antes de responder (puede tardar varios segundos).`
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID numérico del submission a re-ejecutar',
        example: 123,
        type: Number
    }),
    (0, swagger_1.ApiOkResponse)({
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
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Submission no encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "executeSubmissionRoute", null);
__decorate([
    (0, common_1.Get)('metrics/json'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener métricas del sistema de submissions',
        description: 'Retorna métricas JSON sobre submissions procesadas, tiempos de ejecución, runners activos, etc.',
    }),
    (0, swagger_1.ApiOkResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getMetrics", null);
exports.SubmissionController = SubmissionController = SubmissionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Submissions'),
    (0, common_1.Controller)('submissions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT inválido o faltante' }),
    __metadata("design:paramtypes", [create_submission_use_case_1.CreateSubmissionUseCase,
        prisma_submission_repository_1.PrismaSubmissionRepository,
        prisma_challenge_repository_1.PrismaChallengeRepository,
        observability_service_1.ObservabilityService,
        prisma_service_1.PrismaService])
], SubmissionController);
//# sourceMappingURL=submission.controller.js.map