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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const challenges_1 = require("../../application/dtos/challenges");
const challenges_2 = require("../../application/dtos/challenges");
const createchallenge_usecase_1 = require("../../application/usesCases/challenge/createchallenge.usecase");
const findchallengebyid_usecase_1 = require("../../application/usesCases/challenge/findchallengebyid.usecase");
const findallchallenges_usecase_1 = require("../../application/usesCases/challenge/findallchallenges.usecase");
const updatechallenge_usecase_1 = require("../../application/usesCases/challenge/updatechallenge.usecase");
const deletechallenge_usecase_1 = require("../../application/usesCases/challenge/deletechallenge.usecase");
const common_2 = require("@nestjs/common");
const tokens_1 = require("../../application/tokens");
const user_entity_1 = require("../../domain/entities/user.entity");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
let ChallengesController = class ChallengesController {
    createChallengeUseCase;
    getChallengeByIdUseCase;
    getAllChallengesUseCase;
    updateChallengeUseCase;
    deleteChallengeUseCase;
    challengeRepo;
    constructor(createChallengeUseCase, getChallengeByIdUseCase, getAllChallengesUseCase, updateChallengeUseCase, deleteChallengeUseCase, challengeRepo) {
        this.createChallengeUseCase = createChallengeUseCase;
        this.getChallengeByIdUseCase = getChallengeByIdUseCase;
        this.getAllChallengesUseCase = getAllChallengesUseCase;
        this.updateChallengeUseCase = updateChallengeUseCase;
        this.deleteChallengeUseCase = deleteChallengeUseCase;
        this.challengeRepo = challengeRepo;
    }
    async create(data, req) {
        data.authorId = req.user.userId;
        if (!data.difficulty) {
            data.difficulty = 'EASY';
        }
        if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
            data.tags = ['general'];
        }
        return await this.createChallengeUseCase.execute(data);
    }
    async findAll() {
        return await this.getAllChallengesUseCase.execute();
    }
    async findOne(id, req) {
        const challenge = await this.getChallengeByIdUseCase.execute(id);
        const userRole = req.user?.role;
        if (userRole === 'STUDENT') {
            return challenge;
        }
        return challenge;
    }
    async update(id, data) {
        return await this.updateChallengeUseCase.execute(id, data);
    }
    async delete(id) {
        return await this.deleteChallengeUseCase.execute(id);
    }
    async uploadSolution(challengeId, body) {
        const challenge = await this.challengeRepo.findById(challengeId);
        if (!challenge) {
            throw new Error(`Challenge ${challengeId} not found`);
        }
        await this.updateChallengeUseCase.execute(challengeId, {
            solutionCode: body.code,
            solutionLanguage: body.language,
        });
        return {
            message: 'Solution code uploaded successfully',
            challengeId,
        };
    }
    async addTestCases(challengeId, testcases) {
        const challenge = await this.challengeRepo.findById(challengeId);
        if (!challenge) {
            throw new Error(`Challenge ${challengeId} not found`);
        }
        await this.challengeRepo.addTestCases(challengeId, testcases);
        return {
            message: 'Test cases added successfully',
            count: testcases.length,
        };
    }
};
exports.ChallengesController = ChallengesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear un nuevo reto',
        description: 'Crea un nuevo reto algorítmico. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiBody)({
        type: challenges_1.CreateChallengeDto,
        examples: {
            twoSum: {
                summary: 'Two Sum Challenge',
                value: {
                    title: 'Two Sum',
                    description: 'Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target.\n\nInput:\n- Primera línea: los números del array separados por espacio.\n- Segunda línea: el valor target.\n\nOutput:\n- Los dos índices separados por espacio (orden ascendente).',
                    difficulty: 'EASY',
                    tags: ['arrays', 'hash-table'],
                    timeLimit: 1000,
                    memoryLimit: 128,
                    authorId: '00001111-2222-3333-4444-555566667777',
                    isPublic: true
                }
            },
            fibonacci: {
                summary: 'Fibonacci Challenge',
                value: {
                    title: 'Fibonacci Sequence',
                    description: 'Escribe una función que calcule el n-ésimo número de Fibonacci.\n\nLa sucesión de Fibonacci se define como:\n- F(0) = 0\n- F(1) = 1\n- F(n) = F(n-1) + F(n-2) para n > 1\n\nInput:\n- Un único número entero n (0 <= n <= 30).\n\nOutput:\n- El n-ésimo número de Fibonacci.',
                    difficulty: 'MEDIUM',
                    tags: ['dynamic-programming', 'recursion', 'math'],
                    timeLimit: 1000,
                    memoryLimit: 128,
                    authorId: '00001111-2222-3333-4444-555566667777',
                    isPublic: true
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Reto creado exitosamente',
        schema: {
            example: {
                id: 'CH-ABCDE',
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target...',
                difficulty: 'EASY',
                tags: ['arrays', 'hash-table'],
                timeLimit: 1000,
                memoryLimit: 128,
                status: 'DRAFT',
                isPublic: true,
                authorId: '00001111-2222-3333-4444-555566667777',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T10:30:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden crear retos.' }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Título duplicado. Ya existe un reto con este título.',
        schema: {
            example: {
                statusCode: 409,
                message: "Challenge with title 'Two Sum' already exists. Please choose a different title.",
                error: 'Conflict'
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [challenges_1.CreateChallengeDto, Object]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener todos los retos',
        description: 'Devuelve una lista de todos los retos. Disponible para todos los usuarios autenticados.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de retos obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 'CH-ABCDE',
                    title: 'Two Sum',
                    description: 'Given an array of integers nums and an integer target...',
                    difficulty: 'EASY',
                    tags: ['arrays', 'hash-table'],
                    timeLimit: 1000,
                    memoryLimit: 128,
                    status: 'PUBLISHED',
                    isPublic: true,
                    authorId: '00001111-2222-3333-4444-555566667777',
                    createdAt: '2025-10-29T10:30:00.000Z',
                    updatedAt: '2025-10-29T10:30:00.000Z'
                },
                {
                    id: 'CH-FGHIJ',
                    title: 'Fibonacci Sequence',
                    description: 'Write a function to calculate the nth Fibonacci number.',
                    difficulty: 'MEDIUM',
                    tags: ['dynamic-programming', 'recursion'],
                    timeLimit: 2000,
                    memoryLimit: 256,
                    status: 'PUBLISHED',
                    isPublic: false,
                    authorId: '00001111-2222-3333-4444-555566667777',
                    createdAt: '2025-10-29T11:00:00.000Z',
                    updatedAt: '2025-10-29T11:00:00.000Z'
                }
            ]
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener un reto por ID',
        description: 'Devuelve los detalles de un reto específico. Disponible para todos los usuarios autenticados. Los estudiantes pueden ver el código de solución si está disponible.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del reto',
        example: '00001111-2222-3333-4444-555566667777',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reto encontrado exitosamente',
        schema: {
            example: {
                id: 'CH-ABCDE',
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                difficulty: 'EASY',
                tags: ['arrays', 'hash-table'],
                timeLimit: 1000,
                memoryLimit: 128,
                status: 'PUBLISHED',
                isPublic: true,
                solutionCode: 'def two_sum(nums, target):\n    ...',
                solutionLanguage: 'python',
                authorId: '00001111-2222-3333-4444-555566667777',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T10:30:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Reto no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar un reto',
        description: 'Actualiza los datos de un reto existente. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del reto a actualizar',
        example: '00001111-2222-3333-4444-555566667777',
    }),
    (0, swagger_1.ApiBody)({
        type: challenges_2.UpdateChallengeDto,
        examples: {
            updateTitle: {
                summary: 'Actualizar título y descripción',
                value: {
                    title: 'Two Sum - Updated',
                    description: 'Updated description: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
                    difficulty: 'EASY'
                }
            },
            publishChallenge: {
                summary: 'Publicar reto',
                value: {
                    status: 'PUBLISHED',
                    isPublic: true
                }
            },
            adjustLimits: {
                summary: 'Ajustar límites de tiempo y memoria',
                value: {
                    timeLimit: 1500,
                    memoryLimit: 256,
                    tags: ['arrays', 'hash-table', 'two-pointers']
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reto actualizado exitosamente',
        schema: {
            example: {
                id: 'CH-ABCDE',
                title: 'Two Sum - Updated',
                description: 'Updated description: Given an array of integers nums and an integer target...',
                difficulty: 'EASY',
                tags: ['arrays', 'hash-table', 'two-pointers'],
                timeLimit: 1500,
                memoryLimit: 256,
                status: 'PUBLISHED',
                isPublic: true,
                authorId: '00001111-2222-3333-4444-555566667777',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T12:00:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Reto no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden actualizar retos.' }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Título duplicado. Ya existe otro reto con este título.',
        schema: {
            example: {
                statusCode: 409,
                message: "Challenge with title 'Two Sum' already exists. Please choose a different title.",
                error: 'Conflict'
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, challenges_2.UpdateChallengeDto]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un reto',
        description: 'Elimina permanentemente un reto del sistema. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del reto a eliminar',
        example: 'CH-ABCDE',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reto eliminado exitosamente',
        schema: {
            example: {
                message: 'Challenge deleted successfully',
                id: 'CH-ABCDE',
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Reto no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden eliminar retos.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/solution'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Subir código de solución de referencia',
        description: 'Sube el código de solución de referencia para un reto. Solo disponible para ADMIN y PROFESSOR. Los estudiantes podrán ver este código en los detalles del challenge.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del reto',
        example: 'CH-ABCDE',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Código de solución y lenguaje',
        schema: {
            example: {
                code: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
                language: 'python'
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Código de solución subido exitosamente',
        schema: {
            example: {
                message: 'Solution code uploaded successfully',
                challengeId: 'CH-ABCDE'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Reto no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden subir código de solución.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "uploadSolution", null);
__decorate([
    (0, common_1.Post)(':id/testcases'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Agregar casos de prueba a un reto',
        description: 'Agrega uno o más casos de prueba a un reto existente. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del reto al que se agregarán los test cases',
        example: 'CH-ABCDE',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Array de casos de prueba a agregar',
        type: [challenges_1.CreateTestCaseDto],
        examples: {
            twoSum: {
                summary: 'Agregar casos de prueba (Ejemplo Two Sum)',
                value: [
                    { caseNumber: 1, input: '2 7 11 15\n9', output: '0 1', visible: true },
                    { caseNumber: 2, input: '3 2 4\n6', output: '1 2', visible: false }
                ]
            },
            fibonacci: {
                summary: 'Agregar casos de prueba (Ejemplo Fibonacci)',
                value: [
                    { caseNumber: 1, input: '0', output: '0', visible: true },
                    { caseNumber: 2, input: '1', output: '1', visible: true },
                    { caseNumber: 3, input: '5', output: '5', visible: true },
                    { caseNumber: 4, input: '10', output: '55', visible: false }
                ]
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Casos de prueba agregados exitosamente',
        schema: {
            example: {
                message: 'Test cases added successfully',
                count: 2
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Reto no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden agregar casos de prueba.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "addTestCases", null);
exports.ChallengesController = ChallengesController = __decorate([
    (0, swagger_1.ApiTags)('Challenges'),
    (0, common_1.Controller)('challenges'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT inválido o faltante' }),
    __param(5, (0, common_2.Inject)(tokens_1.CHALLENGE_REPOSITORY)),
    __metadata("design:paramtypes", [createchallenge_usecase_1.CreateChallengeUseCase,
        findchallengebyid_usecase_1.FindChallengeByIdUseCase,
        findallchallenges_usecase_1.FindAllChallengesUseCase,
        updatechallenge_usecase_1.UpdateChallengeUseCase,
        deletechallenge_usecase_1.DeleteChallengeUseCase, Object])
], ChallengesController);
//# sourceMappingURL=challenge.controller.js.map