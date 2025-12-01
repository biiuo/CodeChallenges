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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const createcourse_usecase_1 = require("../../application/usesCases/course/createcourse.usecase");
const findcourse_usecase_1 = require("../../application/usesCases/course/findcourse.usecase");
const findallcourse_usecase_1 = require("../../application/usesCases/course/findallcourse.usecase");
const updatecourse_usecase_1 = require("../../application/usesCases/course/updatecourse.usecase");
const deletecourse_usecase_1 = require("../../application/usesCases/course/deletecourse.usecase");
const addchallengestocourse_usecase_1 = require("../../application/usesCases/course/addchallengestocourse.usecase");
const removechallengesfromcourse_usecase_1 = require("../../application/usesCases/course/removechallengesfromcourse.usecase");
const getcoursechallenges_usecase_1 = require("../../application/usesCases/course/getcoursechallenges.usecase");
const getcoursestatistics_usecase_1 = require("../../application/usesCases/course/getcoursestatistics.usecase");
const clonechallengstocourse_usecase_1 = require("../../application/usesCases/course/clonechallengstocourse.usecase");
const publishcourse_usecase_1 = require("../../application/usesCases/course/publishcourse.usecase");
const course_1 = require("../../application/dtos/course");
const user_entity_1 = require("../../domain/entities/user.entity");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
let CoursesController = class CoursesController {
    createCourse;
    findCourse;
    getAllCourses;
    updateCourse;
    deleteCourse;
    addChallengesToCourse;
    removeChallengesFromCourse;
    getCourseChallenges;
    getCourseStatistics;
    cloneChallengesToCourse;
    publishCourse;
    prisma;
    constructor(createCourse, findCourse, getAllCourses, updateCourse, deleteCourse, addChallengesToCourse, removeChallengesFromCourse, getCourseChallenges, getCourseStatistics, cloneChallengesToCourse, publishCourse, prisma) {
        this.createCourse = createCourse;
        this.findCourse = findCourse;
        this.getAllCourses = getAllCourses;
        this.updateCourse = updateCourse;
        this.deleteCourse = deleteCourse;
        this.addChallengesToCourse = addChallengesToCourse;
        this.removeChallengesFromCourse = removeChallengesFromCourse;
        this.getCourseChallenges = getCourseChallenges;
        this.getCourseStatistics = getCourseStatistics;
        this.cloneChallengesToCourse = cloneChallengesToCourse;
        this.publishCourse = publishCourse;
        this.prisma = prisma;
    }
    async create(dto) {
        return this.createCourse.execute(dto);
    }
    async findAll() {
        return this.getAllCourses.execute();
    }
    async findMy(req) {
        const userId = req.user?.id;
        if (!this.prisma) {
            return this.getAllCourses.execute();
        }
        const courses = await this.prisma.course.findMany({
            where: {
                students: {
                    some: { userId: userId },
                },
            },
            include: {
                _count: { select: { students: true, challenges: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return courses;
    }
    async findOne(code) {
        return this.findCourse.execute(code);
    }
    async update(code, dto) {
        return this.updateCourse.execute(code, dto);
    }
    async remove(code) {
        return this.deleteCourse.execute(code);
    }
    async addChallenges(courseId, dto) {
        return this.addChallengesToCourse.execute({
            courseId,
            challengeIds: dto.challengeIds
        });
    }
    async removeChallenges(courseId, dto) {
        return this.removeChallengesFromCourse.execute({
            courseId,
            challengeIds: dto.challengeIds
        });
    }
    async getChallenges(courseId) {
        return this.getCourseChallenges.execute(courseId);
    }
    async getStatistics(courseId) {
        return this.getCourseStatistics.execute(courseId);
    }
    async cloneChallenges(targetCourseId, sourceCourseId) {
        return this.cloneChallengesToCourse.execute({
            sourceCourseId,
            targetCourseId
        });
    }
    async publishUnpublish(courseId, body) {
        return this.publishCourse.execute(courseId, body.isPublished);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear un nuevo curso',
        description: 'Crea un nuevo curso académico. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiBody)({
        type: course_1.CreateCourseDTO,
        examples: {
            programmingCourse: {
                summary: 'Curso de Programación',
                value: {
                    code: 'PROG101',
                    name: 'Introducción a la Programación',
                    period: '2025-1',
                    professorCode: ['PROF2025001']
                }
            },
            algorithmsCourse: {
                summary: 'Curso de Algoritmos',
                value: {
                    code: 'ALG301',
                    name: 'Algoritmos y Estructuras de Datos',
                    period: '2025-1',
                    professorCode: ['PROF2025001']
                }
            },
            webDevCourse: {
                summary: 'Curso de Desarrollo Web',
                value: {
                    code: 'WEB201',
                    name: 'Desarrollo Web Full Stack',
                    period: '2025-2',
                    professorCode: ['PROF2025001']
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Curso creado exitosamente',
        schema: {
            example: {
                id: '00001111-2222-3333-4444-555566667777',
                code: 'PROG101',
                name: 'Introducción a la Programación',
                period: '2025-1',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T10:30:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden crear cursos.' }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'El curso ya existe',
        schema: {
            example: {
                message: "Course with code 'PROG101' already exists",
                error: 'Conflict',
                statusCode: 409
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_1.CreateCourseDTO]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener todos los cursos',
        description: 'Devuelve una lista de todos los cursos. Disponible para todos los usuarios autenticados.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de cursos obtenida exitosamente',
        schema: {
            example: [
                {
                    id: '00001111-2222-3333-4444-555566667777',
                    code: 'PROG101',
                    name: 'Introducción a la Programación',
                    period: '2025-1',
                    createdAt: '2025-10-29T10:30:00.000Z',
                    updatedAt: '2025-10-29T10:30:00.000Z'
                },
                {
                    id: '00001111-2222-3333-4444-555566667777',
                    code: 'ALG301',
                    name: 'Algoritmos y Estructuras de Datos',
                    period: '2025-1',
                    createdAt: '2025-10-29T11:00:00.000Z',
                    updatedAt: '2025-10-29T11:00:00.000Z'
                },
                {
                    id: '00001111-2222-3333-4444-555566667777',
                    code: 'WEB201',
                    name: 'Desarrollo Web Full Stack',
                    period: '2025-2',
                    createdAt: '2025-10-29T11:30:00.000Z',
                    updatedAt: '2025-10-29T11:30:00.000Z'
                }
            ]
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener cursos del usuario autenticado',
        description: 'Devuelve la lista de cursos en los que el usuario está inscrito.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Cursos del usuario obtenidos' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener un curso por código',
        description: 'Devuelve los detalles de un curso específico. Disponible para todos los usuarios autenticados.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'Código único del curso',
        example: 'PROG101'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Curso encontrado exitosamente',
        schema: {
            example: {
                id: '00001111-2222-3333-4444-555566667777',
                code: 'PROG101',
                name: 'Introducción a la Programación',
                period: '2025-1',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T10:30:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':code'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar un curso',
        description: 'Actualiza los datos de un curso existente. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'Código único del curso a actualizar',
        example: 'PROG101'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                period: { type: 'string' }
            }
        },
        examples: {
            updateName: {
                summary: 'Actualizar nombre del curso',
                value: {
                    name: 'Introducción a la Programación - Actualizado',
                    period: '2025-1'
                }
            },
            updatePeriod: {
                summary: 'Cambiar período',
                value: {
                    period: '2025-2'
                }
            },
            fullUpdate: {
                summary: 'Actualización completa',
                value: {
                    name: 'Fundamentos de Programación',
                    period: '2025-2'
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Curso actualizado exitosamente',
        schema: {
            example: {
                id: '00001111-2222-3333-4444-555566667777',
                code: 'PROG101',
                name: 'Introducción a la Programación - Actualizado',
                period: '2025-1',
                createdAt: '2025-10-29T10:30:00.000Z',
                updatedAt: '2025-10-29T12:00:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden actualizar cursos.' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':code'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un curso',
        description: 'Elimina permanentemente un curso del sistema. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'Código único del curso a eliminar',
        example: 'PROG101'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Curso eliminado exitosamente',
        schema: {
            example: {
                message: 'Course deleted successfully',
                code: 'PROG101'
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden eliminar cursos.' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/challenges'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: 'Agregar challenges a un curso',
        description: 'Asocia uno o más retos algorítmicos a un curso específico. Solo disponible para ADMIN y PROFESSOR. Los estudiantes inscritos en el curso podrán acceder a estos retos.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del curso',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiBody)({
        type: course_1.AddChallengesToCourseDTO,
        examples: {
            singleChallenge: {
                summary: 'Agregar un reto',
                value: {
                    challengeIds: ['CH-ABCDE']
                }
            },
            multipleChallenges: {
                summary: 'Agregar múltiples retos',
                value: {
                    challengeIds: ['CH-ABCDE', 'CH-FGHIJ', 'CH-KLMNO']
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Challenges agregados exitosamente al curso',
        schema: {
            example: {
                message: 'Successfully added 3 challenge(s) to course',
                addedCount: 3,
                alreadyInCourse: []
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso o challenge(s) no encontrados' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden agregar challenges a cursos.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_1.AddChallengesToCourseDTO]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "addChallenges", null);
__decorate([
    (0, common_1.Delete)(':id/challenges'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, swagger_1.ApiOperation)({
        summary: 'Remover challenges de un curso',
        description: 'Desasocia uno o más retos de un curso específico. Solo disponible para ADMIN y PROFESSOR. Los estudiantes ya no podrán acceder a estos retos a través de este curso.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del curso',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiBody)({
        type: course_1.RemoveChallengesToCourseDTO,
        examples: {
            singleChallenge: {
                summary: 'Remover un reto',
                value: {
                    challengeIds: ['CH-ABCDE']
                }
            },
            multipleChallenges: {
                summary: 'Remover múltiples retos',
                value: {
                    challengeIds: ['CH-ABCDE', 'CH-FGHIJ']
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Challenges removidos exitosamente del curso',
        schema: {
            example: {
                message: 'Successfully removed 2 challenge(s) from course',
                removedCount: 2
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden remover challenges de cursos.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_1.RemoveChallengesToCourseDTO]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "removeChallenges", null);
__decorate([
    (0, common_1.Get)(':id/challenges'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener challenges de un curso',
        description: 'Devuelve la lista de todos los retos asociados a un curso específico. Disponible para todos los usuarios autenticados. Los estudiantes solo verán los retos del curso en el que están inscritos.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del curso',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de challenges del curso obtenida exitosamente',
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
                    author: {
                        id: '00001111-2222-3333-4444-555566667777',
                        name: 'Prof. Juan Pérez',
                        username: 'jperez'
                    },
                    testcases: [],
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
                    author: {
                        id: '00001111-2222-3333-4444-555566667777',
                        name: 'Prof. Juan Pérez',
                        username: 'jperez'
                    },
                    testcases: [],
                    createdAt: '2025-10-29T11:00:00.000Z',
                    updatedAt: '2025-10-29T11:00:00.000Z'
                }
            ]
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getChallenges", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener estadísticas del curso',
        description: 'Devuelve estadísticas detalladas del curso incluyendo progreso de estudiantes, estadísticas por challenge, y métricas generales. Solo disponible para ADMIN y PROFESSOR.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del curso',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Estadísticas del curso obtenidas exitosamente',
        schema: {
            example: {
                courseId: '00001111-2222-3333-4444-555566667777',
                courseName: 'Introducción a la Programación',
                totalStudents: 25,
                totalChallenges: 5,
                totalSubmissions: 150,
                challengeStats: [
                    {
                        challengeId: 'CH-ABCDE',
                        title: 'Two Sum',
                        difficulty: 'EASY',
                        totalAttempts: 50,
                        successfulSubmissions: 35,
                        successRate: 70.0
                    }
                ],
                studentProgress: [
                    {
                        studentId: 'ST-12345',
                        studentName: 'Ana García',
                        challengesCompleted: 3,
                        totalSubmissions: 8,
                        averageScore: 85.5
                    }
                ]
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden ver estadísticas.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Post)(':targetId/clone-from/:sourceId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Clonar challenges de un curso a otro',
        description: 'Copia todos los challenges de un curso origen a un curso destino. Solo disponible para ADMIN y PROFESSOR. Útil para reutilizar retos entre diferentes grupos o períodos.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'targetId',
        description: 'ID del curso destino (donde se copiarán los challenges)',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiParam)({
        name: 'sourceId',
        description: 'ID del curso origen (desde donde se copiarán los challenges)',
        example: '00001111-2222-3333-4444-555566668888'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Challenges clonados exitosamente',
        schema: {
            example: {
                message: 'Successfully cloned 5 challenge(s) from source course to target course',
                clonedCount: 5,
                skippedCount: 2
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso origen o destino no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden clonar challenges.' }),
    __param(0, (0, common_1.Param)('targetId')),
    __param(1, (0, common_1.Param)('sourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "cloneChallenges", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN, user_entity_1.Role.PROFESSOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Publicar o despublicar un curso',
        description: 'Cambia el estado de publicación de un curso. Solo disponible para ADMIN y PROFESSOR. Los cursos publicados son visibles para inscripción de estudiantes.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del curso',
        example: '00001111-2222-3333-4444-555566667777'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                isPublished: {
                    type: 'boolean',
                    description: 'true para publicar, false para despublicar'
                }
            },
            required: ['isPublished']
        },
        examples: {
            publish: {
                summary: 'Publicar curso',
                value: { isPublished: true }
            },
            unpublish: {
                summary: 'Despublicar curso',
                value: { isPublished: false }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Estado de publicación actualizado exitosamente',
        schema: {
            example: {
                message: 'Course published successfully. Students can now enroll.',
                courseId: '00001111-2222-3333-4444-555566667777',
                isPublished: true
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Curso no encontrado' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Sin permisos. Solo ADMIN y PROFESSOR pueden publicar cursos.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "publishUnpublish", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)('Courses'),
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token JWT inválido o faltante' }),
    __metadata("design:paramtypes", [createcourse_usecase_1.CreateCourseUseCase,
        findcourse_usecase_1.FindCourseByCodeUseCase,
        findallcourse_usecase_1.FindAllCoursesUseCase,
        updatecourse_usecase_1.UpdateCourseUseCase,
        deletecourse_usecase_1.DeleteCourseUseCase,
        addchallengestocourse_usecase_1.AddChallengesToCourseUseCase,
        removechallengesfromcourse_usecase_1.RemoveChallengesFromCourseUseCase,
        getcoursechallenges_usecase_1.GetCourseChallengesUseCase,
        getcoursestatistics_usecase_1.GetCourseStatisticsUseCase,
        clonechallengstocourse_usecase_1.CloneChallengesToCourseUseCase,
        publishcourse_usecase_1.PublishCourseUseCase,
        prisma_service_1.PrismaService])
], CoursesController);
//# sourceMappingURL=course.controller.js.map