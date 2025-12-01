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
exports.EvaluationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const evaluation_dto_1 = require("../../application/dtos/evaluation.dto");
let EvaluationsController = class EvaluationsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWithChallenges(courseId, dto, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        const lastEval = await this.prisma.evaluation.findFirst({
            where: { courseId },
            orderBy: { evaluationNumber: 'desc' },
        });
        const evaluationNumber = (lastEval?.evaluationNumber || 0) + 1;
        const evaluation = await this.prisma.evaluation.create({
            data: {
                name: dto.name,
                description: dto.description,
                date: new Date(dto.date),
                maxDuration: dto.maxDuration,
                courseId,
                evaluationNumber,
                ...(dto.challengeIds && dto.challengeIds.length > 0 && {
                    challenges: {
                        create: dto.challengeIds.map((challengeId) => ({
                            challengeId,
                        })),
                    },
                }),
            },
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                },
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, difficulty: true }
                        }
                    }
                }
            }
        });
        return evaluation;
    }
    async create(dto, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (!dto.courseId) {
            throw new Error('courseId is required');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: dto.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        const lastEval = await this.prisma.evaluation.findFirst({
            where: { courseId: dto.courseId },
            orderBy: { evaluationNumber: 'desc' },
        });
        const evaluationNumber = (lastEval?.evaluationNumber || 0) + 1;
        return this.prisma.evaluation.create({
            data: {
                name: dto.name,
                description: dto.description,
                date: new Date(dto.date),
                maxDuration: dto.maxDuration,
                courseId: dto.courseId,
                evaluationNumber,
            },
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                }
            }
        });
    }
    async list(req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === 'STUDENT' && userId) {
            const enrollments = await this.prisma.courseStudent.findMany({
                where: { userId },
                select: { courseId: true }
            });
            const courseIds = enrollments.map(e => e.courseId);
            return this.prisma.evaluation.findMany({
                where: { courseId: { in: courseIds } },
                include: {
                    course: {
                        select: { id: true, name: true, code: true }
                    },
                    challenges: {
                        include: {
                            challenge: {
                                select: { id: true, title: true, difficulty: true }
                            }
                        }
                    }
                }
            });
        }
        if (role === 'PROFESSOR' && userId) {
            const professorCourses = await this.prisma.course.findMany({
                where: { professors: { some: { id: userId } } },
                select: { id: true }
            });
            const courseIds = professorCourses.map(c => c.id);
            return this.prisma.evaluation.findMany({
                where: { courseId: { in: courseIds } },
                include: {
                    course: {
                        select: { id: true, name: true, code: true }
                    },
                    challenges: {
                        include: {
                            challenge: {
                                select: { id: true, title: true, difficulty: true }
                            }
                        }
                    }
                }
            });
        }
        return this.prisma.evaluation.findMany({
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                },
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, difficulty: true }
                        }
                    }
                }
            }
        });
    }
    async get(id, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                },
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, description: true, difficulty: true, tags: true }
                        }
                    }
                }
            }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'STUDENT' && userId) {
            const enrollment = await this.prisma.courseStudent.findUnique({
                where: { userId_courseId: { userId, courseId: evaluation.courseId } }
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        const transformedEvaluation = {
            ...evaluation,
            challenges: evaluation.challenges.map(ec => ec.challenge)
        };
        return transformedEvaluation;
    }
    async update(id, dto, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            select: { courseId: true }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        if (dto.challengeIds && dto.challengeIds.length > 0) {
            await this.prisma.evaluationChallenge.deleteMany({
                where: { evaluationId: Number(id) }
            });
            await this.prisma.evaluationChallenge.createMany({
                data: dto.challengeIds.map(challengeId => ({
                    evaluationId: Number(id),
                    challengeId: challengeId
                }))
            });
        }
        return this.prisma.evaluation.update({
            where: { id: Number(id) },
            data: {
                name: dto.name,
                description: dto.description,
                date: dto.date ? new Date(dto.date) : undefined,
                maxDuration: dto.maxDuration
            },
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                },
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, description: true, difficulty: true }
                        }
                    }
                }
            }
        });
    }
    async remove(id, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            select: { courseId: true }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        await this.prisma.evaluationChallenge.deleteMany({
            where: { evaluationId: Number(id) }
        });
        return this.prisma.evaluation.delete({
            where: { id: Number(id) },
            include: {
                course: {
                    select: { id: true, name: true, code: true }
                }
            }
        });
    }
    async addChallenge(id, challengeId, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            select: { courseId: true }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        await this.prisma.evaluationChallenge.create({ data: { evaluationId: Number(id), challengeId } });
        return { ok: true };
    }
    async removeChallenge(id, challengeId, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            select: { courseId: true }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        await this.prisma.evaluationChallenge.delete({
            where: { evaluationId_challengeId: { evaluationId: Number(id), challengeId } },
        });
        return { ok: true };
    }
    async listSubmissions(id, req, studentId) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === 'STUDENT') {
            return this.prisma.submission.findMany({
                where: {
                    evaluationId: Number(id),
                    userId: userId
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, username: true }
                    },
                    challenge: {
                        select: { id: true, title: true }
                    }
                }
            });
        }
        const where = { evaluationId: Number(id) };
        if (studentId) {
            where.userId = studentId;
        }
        return this.prisma.submission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, username: true }
                },
                challenge: {
                    select: { id: true, title: true }
                }
            }
        });
    }
    async getEvaluationStatistics(id, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            select: { courseId: true }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (role === 'PROFESSOR' && userId) {
            const course = await this.prisma.course.findFirst({
                where: {
                    id: evaluation.courseId,
                    professors: { some: { id: userId } }
                }
            });
            if (!course) {
                throw new Error('You are not a professor of this course');
            }
        }
        const totalSubmissions = await this.prisma.submission.count({
            where: { evaluationId: Number(id) }
        });
        const acceptedSubmissions = await this.prisma.submission.count({
            where: { evaluationId: Number(id), status: 'ACCEPTED' }
        });
        const uniqueStudents = await this.prisma.submission.groupBy({
            by: ['userId'],
            where: { evaluationId: Number(id) }
        });
        const submissionsByChallenge = await this.prisma.submission.groupBy({
            by: ['challengeId'],
            where: { evaluationId: Number(id) },
            _count: { challengeId: true },
            _avg: { score: true }
        });
        const topStudents = await this.prisma.submission.groupBy({
            by: ['userId'],
            where: { evaluationId: Number(id) },
            _sum: { score: true },
            _count: { userId: true }
        });
        const topStudentsWithNames = await Promise.all(topStudents
            .sort((a, b) => (b._sum.score || 0) - (a._sum.score || 0))
            .slice(0, 10)
            .map(async (s) => {
            const user = await this.prisma.user.findUnique({
                where: { id: s.userId },
                select: { id: true, name: true, username: true }
            });
            return {
                user,
                totalScore: s._sum.score || 0,
                totalSubmissions: s._count.userId
            };
        }));
        return {
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
            uniqueStudents: uniqueStudents.length,
            submissionsByChallenge: submissionsByChallenge.map(s => ({
                challengeId: s.challengeId,
                totalSubmissions: s._count.challengeId,
                averageScore: s._avg.score ? Math.round(s._avg.score) : 0
            })),
            topStudents: topStudentsWithNames
        };
    }
    async getMyResults(id, req) {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: Number(id) },
            include: {
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, difficulty: true }
                        }
                    }
                }
            }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        const enrollment = await this.prisma.courseStudent.findUnique({
            where: { userId_courseId: { userId, courseId: evaluation.courseId } }
        });
        if (!enrollment) {
            throw new Error('You are not enrolled in this course');
        }
        const submissions = await this.prisma.submission.findMany({
            where: {
                userId,
                evaluationId: Number(id)
            },
            include: {
                challenge: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const challengeScores = {};
        evaluation.challenges.forEach(ec => {
            const challengeSubs = submissions.filter(s => s.challengeId === ec.challengeId);
            if (challengeSubs.length > 0) {
                const bestScore = Math.max(...challengeSubs.map(s => s.score || 0));
                challengeScores[ec.challengeId] = bestScore;
            }
            else {
                challengeScores[ec.challengeId] = 0;
            }
        });
        const totalChallenges = evaluation.challenges.length;
        const totalScore = Object.values(challengeScores).reduce((sum, score) => sum + score, 0);
        const finalScore = totalChallenges > 0 ? Math.round(totalScore / totalChallenges) : 0;
        return {
            evaluation: {
                ...evaluation,
                challenges: evaluation.challenges.map(ec => ec.challenge)
            },
            score: finalScore,
            challengeScores,
            submissions: submissions.map(s => ({
                id: s.id,
                challengeId: s.challengeId,
                challengeTitle: s.challenge.title,
                status: s.status,
                score: s.score,
                timeMsTotal: s.timeMsTotal,
                createdAt: s.createdAt
            }))
        };
    }
};
exports.EvaluationsController = EvaluationsController;
__decorate([
    (0, common_1.Post)('courses/:courseId/evaluations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear evaluación con challenges (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "createWithChallenges", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear evaluación (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluation_dto_1.CreateEvaluationDto, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar evaluaciones' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evaluación por id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar evaluación (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, evaluation_dto_1.UpdateEvaluationDto, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar evaluación (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/challenges/:challengeId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Añadir challenge a evaluación (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "addChallenge", null);
__decorate([
    (0, common_1.Delete)(':id/challenges/:challengeId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Quitar challenge de evaluación (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "removeChallenge", null);
__decorate([
    (0, common_1.Get)(':id/submissions'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar submissions de la evaluación' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "listSubmissions", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de la evaluación (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "getEvaluationStatistics", null);
__decorate([
    (0, common_1.Get)(':id/my-results'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis resultados en la evaluación (STUDENT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "getMyResults", null);
exports.EvaluationsController = EvaluationsController = __decorate([
    (0, swagger_1.ApiTags)('Evaluations'),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('evaluations'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvaluationsController);
//# sourceMappingURL=evaluations.controller.js.map