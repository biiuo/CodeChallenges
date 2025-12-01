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
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const is_professor_of_course_guard_1 = require("../guards/is-professor-of-course.guard");
const is_member_or_professor_of_course_guard_1 = require("../guards/is-member-or-professor-of-course.guard");
const is_student_of_course_guard_1 = require("../guards/is-student-of-course.guard");
class CreateCourseDto {
    code;
    name;
    period;
}
class UpdateCourseDto {
    name;
    period;
}
let CoursesController = class CoursesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyCourses(req) {
        const userId = req.user?.userId;
        if (!userId)
            throw new Error('No userId');
        return this.prisma.course.findMany({
            where: { students: { some: { userId } } },
            select: { id: true, code: true, name: true, period: true, description: true, isPublished: true }
        });
    }
    async create(body, req) {
        const code = typeof body?.code === 'string' ? body.code.trim() : '';
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        const period = typeof body?.period === 'string' ? body.period.trim() : '';
        if (!code || !name || !period) {
            throw new Error('Invalid payload: code, name and period are required');
        }
        const userId = req.user?.userId;
        const data = {
            code,
            name,
            period,
            professors: userId ? { connect: [{ id: userId }] } : undefined
        };
        if (body.level !== undefined)
            data.level = body.level;
        if (body.category !== undefined)
            data.category = body.category;
        if (body.group !== undefined)
            data.group = body.group;
        if (body.coverImage !== undefined)
            data.coverImage = body.coverImage;
        return this.prisma.course.create({ data });
    }
    async list(req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === 'PROFESSOR' && userId) {
            return this.prisma.course.findMany({
                where: { professors: { some: { id: userId } } },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    period: true,
                    description: true,
                    isPublished: true,
                }
            });
        }
        return this.prisma.course.findMany({
            where: { isPublished: true },
            select: {
                id: true,
                code: true,
                name: true,
                period: true,
                description: true,
                isPublished: true,
            }
        });
    }
    async get(id) {
        return this.prisma.course.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
                period: true,
                description: true,
                isPublished: true,
                professors: { select: { id: true, name: true, username: true, email: true } }
            }
        });
    }
    async getMy(id) {
        return this.prisma.course.findUnique({ where: { id } });
    }
    async update(id, dto) {
        return this.prisma.course.update({ where: { id }, data: { name: dto.name, period: dto.period } });
    }
    async remove(id) {
        return this.prisma.course.delete({ where: { id } });
    }
    async assignProfessor(id, userId, req) {
        const requesterId = req.user?.userId;
        const requesterRole = req.user?.role;
        if (requesterRole !== 'ADMIN' && requesterId !== userId) {
            throw new Error('Solo el admin o el propio profesor pueden asignarse');
        }
        return this.prisma.course.update({
            where: { id },
            data: { professors: { connect: { id: userId } } },
            include: { professors: true },
        });
    }
    async enrollStudent(id, userId) {
        await this.prisma.courseStudent.create({ data: { courseId: id, userId } });
        return { ok: true };
    }
    async selfEnroll(id, req) {
        const userId = req.user?.userId;
        const exists = await this.prisma.courseStudent.findUnique({ where: { userId_courseId: { userId, courseId: id } } });
        if (exists)
            return { ok: true, message: 'Already enrolled' };
        await this.prisma.courseStudent.create({ data: { courseId: id, userId } });
        return { ok: true, message: 'Enrolled successfully' };
    }
    async selfUnenroll(id, req) {
        const userId = req.user?.userId;
        await this.prisma.courseStudent.delete({ where: { userId_courseId: { userId, courseId: id } } });
        return { ok: true, message: 'Unenrolled successfully' };
    }
    async listStudents(id) {
        return this.prisma.courseStudent.findMany({ where: { courseId: id }, include: { user: true } });
    }
    async listChallenges(id, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        console.log(`[listChallenges] CourseId: ${id}, Role: ${role}, UserId: ${userId}`);
        const includeOptions = {
            include: {
                testcases: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        };
        if (role === 'STUDENT') {
            const challenges = await this.prisma.challenge.findMany({
                where: { courses: { some: { id } }, status: 'PUBLISHED' },
                ...includeOptions
            });
            console.log(`[listChallenges] Found ${challenges.length} published challenges for student`);
            return challenges;
        }
        const challenges = await this.prisma.challenge.findMany({
            where: { courses: { some: { id } } },
            ...includeOptions
        });
        console.log(`[listChallenges] Found ${challenges.length} total challenges for admin/professor`);
        return challenges;
    }
    async listMyChallenges(id) {
        return this.prisma.challenge.findMany({
            where: { courses: { some: { id } }, status: 'PUBLISHED' },
            include: {
                testcases: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async assignMultipleChallenges(id, body) {
        const { challengeIds } = body;
        if (!Array.isArray(challengeIds) || challengeIds.length === 0) {
            throw new Error('challengeIds must be a non-empty array');
        }
        await this.prisma.course.update({
            where: { id },
            data: {
                challenges: {
                    connect: challengeIds.map(challengeId => ({ id: challengeId }))
                }
            }
        });
        return {
            message: `Successfully added ${challengeIds.length} challenge(s) to course`,
            addedCount: challengeIds.length
        };
    }
    async publishChallengeInCourse(id, challengeId, body) {
        const course = await this.prisma.course.findFirst({
            where: {
                id,
                challenges: { some: { id: challengeId } }
            }
        });
        if (!course) {
            throw new Error('Challenge not found in this course');
        }
        const updated = await this.prisma.challenge.update({
            where: { id: challengeId },
            data: { status: body.status }
        });
        return {
            message: `Challenge ${body.status === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`,
            challenge: updated
        };
    }
    async assignChallenge(id, challengeId) {
        return this.prisma.challenge.update({ where: { id: challengeId }, data: { courses: { connect: { id } } } });
    }
    async listSubmissions(id, studentId, challengeId, status, evaluationId) {
        const where = { courseId: id };
        if (studentId) {
            where.userId = studentId;
        }
        if (challengeId) {
            where.challengeId = challengeId;
        }
        if (status) {
            where.status = status;
        }
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId, 10);
        }
        return this.prisma.submission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, username: true, email: true }
                },
                challenge: {
                    select: { id: true, title: true, difficulty: true }
                },
                evaluation: {
                    select: { id: true, name: true, evaluationNumber: true }
                }
            }
        });
    }
    async listSubmissionsByChallenge(id, challengeId) {
        return this.prisma.submission.findMany({ where: { courseId: id, challengeId }, orderBy: { createdAt: 'desc' } });
    }
    async listMySubmissions(id, req, evaluationId, challengeId, status) {
        const userId = req.user?.userId;
        const course = await this.prisma.course.findUnique({
            where: { id },
            select: {
                challenges: {
                    select: { id: true }
                }
            }
        });
        if (!course) {
            return [];
        }
        const challengeIdsInCourse = course.challenges.map(c => c.id);
        const where = {
            userId,
            courseId: id
        };
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId, 10);
        }
        if (challengeId) {
            where.challengeId = challengeId;
        }
        if (status) {
            where.status = status;
        }
        return this.prisma.submission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                challenge: {
                    select: { id: true, title: true, difficulty: true }
                },
                evaluation: {
                    select: { id: true, name: true, evaluationNumber: true }
                }
            }
        });
    }
    async listMySubmissionsByEvaluation(courseId, evaluationId, req) {
        const userId = req.user?.userId;
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id: parseInt(evaluationId, 10) },
            select: { courseId: true }
        });
        if (!evaluation || evaluation.courseId !== courseId) {
            throw new Error('Evaluation not found in this course');
        }
        return this.prisma.submission.findMany({
            where: {
                courseId,
                evaluationId: parseInt(evaluationId, 10),
                userId
            },
            orderBy: { createdAt: 'desc' },
            include: {
                challenge: {
                    select: { id: true, title: true, difficulty: true }
                },
                testResults: {
                    select: { caseNumber: true, status: true, timeMs: true }
                }
            }
        });
    }
    async unassignMultipleChallenges(id, body) {
        const { challengeIds } = body;
        if (!Array.isArray(challengeIds) || challengeIds.length === 0) {
            throw new Error('challengeIds must be a non-empty array');
        }
        await this.prisma.course.update({
            where: { id },
            data: {
                challenges: {
                    disconnect: challengeIds.map(challengeId => ({ id: challengeId }))
                }
            }
        });
        return {
            message: `Successfully removed ${challengeIds.length} challenge(s) from course`,
            removedCount: challengeIds.length
        };
    }
    async unassignChallenge(id, challengeId) {
        return this.prisma.challenge.update({ where: { id: challengeId }, data: { courses: { disconnect: { id } } } });
    }
    async removeStudent(id, userId) {
        await this.prisma.courseStudent.delete({ where: { userId_courseId: { userId, courseId: id } } });
        return { ok: true };
    }
    async removeProfessor(id, userId) {
        return this.prisma.course.update({ where: { id }, data: { professors: { disconnect: { id: userId } } } });
    }
    async updateMetadata(id, body) {
        const updates = {};
        if (body.description !== undefined)
            updates.description = body.description;
        if (body.category !== undefined)
            updates.category = body.category;
        if (body.level !== undefined)
            updates.level = body.level;
        if (body.group !== undefined)
            updates.group = body.group;
        if (body.coverImage !== undefined)
            updates.coverImage = body.coverImage;
        if (body.isPublished !== undefined)
            updates.isPublished = body.isPublished;
        return this.prisma.course.update({ where: { id }, data: updates });
    }
    async listLessons(id) {
        return this.prisma.lesson.findMany({
            where: { courseId: id },
            include: { resources: true },
            orderBy: { order: 'asc' },
        });
    }
    async createLesson(id, body) {
        const { title, description, videoUrl, duration, order } = body;
        if (!title)
            throw new Error('Title is required');
        return this.prisma.lesson.create({
            data: {
                courseId: id,
                title,
                description,
                videoUrl,
                duration,
                order: order ?? 0,
            },
        });
    }
    async updateLesson(courseId, lessonId, body) {
        const updates = {};
        if (body.title !== undefined)
            updates.title = body.title;
        if (body.description !== undefined)
            updates.description = body.description;
        if (body.videoUrl !== undefined)
            updates.videoUrl = body.videoUrl;
        if (body.duration !== undefined)
            updates.duration = body.duration;
        if (body.order !== undefined)
            updates.order = body.order;
        return this.prisma.lesson.update({ where: { id: lessonId }, data: updates });
    }
    async deleteLesson(courseId, lessonId) {
        await this.prisma.lesson.delete({ where: { id: lessonId } });
        return { ok: true };
    }
    async addResource(courseId, lessonId, body) {
        const { title, url, type } = body;
        if (!title || !url || !type)
            throw new Error('title, url and type are required');
        return this.prisma.lessonResource.create({
            data: { lessonId, title, url, type },
        });
    }
    async deleteResource(courseId, lessonId, resourceId) {
        await this.prisma.lessonResource.delete({ where: { id: resourceId } });
        return { ok: true };
    }
    async getCourseStatistics(courseId) {
        const totalStudents = await this.prisma.courseStudent.count({
            where: { courseId }
        });
        const totalChallenges = await this.prisma.challenge.count({
            where: { courses: { some: { id: courseId } } }
        });
        const totalSubmissions = await this.prisma.submission.count({
            where: { courseId }
        });
        const acceptedSubmissions = await this.prisma.submission.count({
            where: { courseId, status: 'ACCEPTED' }
        });
        const submissionsByStatus = await this.prisma.submission.groupBy({
            by: ['status'],
            where: { courseId },
            _count: { status: true }
        });
        const submissionsByLanguage = await this.prisma.submission.groupBy({
            by: ['language'],
            where: { courseId },
            _count: { language: true }
        });
        const averageScore = await this.prisma.submission.aggregate({
            where: {
                courseId,
                score: { not: null }
            },
            _avg: { score: true }
        });
        return {
            totalStudents,
            totalChallenges,
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
            averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score) : 0,
            submissionsByStatus: submissionsByStatus.map(s => ({
                status: s.status,
                count: s._count.status
            })),
            submissionsByLanguage: submissionsByLanguage.map(l => ({
                language: l.language,
                count: l._count.language
            }))
        };
    }
    async getStudentStatistics(courseId, studentId, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === 'STUDENT' && userId !== studentId) {
            throw new Error('You can only view your own statistics');
        }
        const totalSubmissions = await this.prisma.submission.count({
            where: { courseId, userId: studentId }
        });
        const acceptedSubmissions = await this.prisma.submission.count({
            where: { courseId, userId: studentId, status: 'ACCEPTED' }
        });
        const submissionsByChallenge = await this.prisma.submission.groupBy({
            by: ['challengeId'],
            where: { courseId, userId: studentId },
            _count: { challengeId: true },
            _max: { score: true }
        });
        const averageScore = await this.prisma.submission.aggregate({
            where: {
                courseId,
                userId: studentId,
                score: { not: null }
            },
            _avg: { score: true }
        });
        const bestSubmissions = await this.prisma.submission.findMany({
            where: {
                courseId,
                userId: studentId,
                status: 'ACCEPTED'
            },
            orderBy: { score: 'desc' },
            take: 5,
            include: {
                challenge: {
                    select: { id: true, title: true, difficulty: true }
                }
            }
        });
        return {
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
            averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score) : 0,
            challengesAttempted: submissionsByChallenge.length,
            submissionsByChallenge: submissionsByChallenge.map(s => ({
                challengeId: s.challengeId,
                attempts: s._count.challengeId,
                bestScore: s._max.score
            })),
            bestSubmissions: bestSubmissions.map(s => ({
                id: s.id,
                challenge: s.challenge,
                score: s.score,
                timeMsTotal: s.timeMsTotal,
                createdAt: s.createdAt
            }))
        };
    }
    async listEvaluations(courseId, req) {
        const role = req.user?.role;
        const userId = req.user?.userId;
        const evaluations = await this.prisma.evaluation.findMany({
            where: { courseId },
            include: {
                challenges: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, difficulty: true }
                        }
                    }
                },
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: { evaluationNumber: 'asc' }
        });
        if (role === 'STUDENT' && userId) {
            const evaluationsWithStudentData = await Promise.all(evaluations.map(async (evaluation) => {
                const studentSubmissions = await this.prisma.submission.findMany({
                    where: {
                        evaluationId: evaluation.id,
                        userId
                    },
                    select: {
                        id: true,
                        status: true,
                        score: true,
                        challengeId: true,
                        createdAt: true
                    }
                });
                return {
                    ...evaluation,
                    studentSubmissions,
                    studentTotalScore: studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0),
                    studentCompleted: studentSubmissions.length > 0
                };
            }));
            return evaluationsWithStudentData;
        }
        return evaluations;
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis cursos (solo estudiante)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getMyCourses", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear curso (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar cursos' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener curso por id (pertenencia requerida)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/my'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseGuards)(is_student_of_course_guard_1.IsStudentOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener curso por id (estudiante inscrito)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getMy", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCourseDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/professors/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar profesor a curso (ADMIN o el propio profesor)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "assignProfessor", null);
__decorate([
    (0, common_1.Post)(':id/students/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Inscribir estudiante en curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "enrollStudent", null);
__decorate([
    (0, common_1.Post)(':id/enroll'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-inscripción en curso (STUDENT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "selfEnroll", null);
__decorate([
    (0, common_1.Delete)(':id/unenroll'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Des-inscripción del curso (STUDENT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "selfUnenroll", null);
__decorate([
    (0, common_1.Get)(':id/students'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar estudiantes del curso (miembros del curso o profesores)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listStudents", null);
__decorate([
    (0, common_1.Get)(':id/challenges'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar retos del curso (miembros del curso o profesores)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listChallenges", null);
__decorate([
    (0, common_1.Get)(':id/my/challenges'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseGuards)(is_student_of_course_guard_1.IsStudentOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar retos del curso (estudiante)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listMyChallenges", null);
__decorate([
    (0, common_1.Post)(':id/challenges'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar múltiples retos al curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "assignMultipleChallenges", null);
__decorate([
    (0, common_1.Put)(':id/challenges/:challengeId/publish'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Publicar/Despublicar un challenge del curso (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "publishChallengeInCourse", null);
__decorate([
    (0, common_1.Post)(':id/challenges/:challengeId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar un reto al curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "assignChallenge", null);
__decorate([
    (0, common_1.Get)(':id/submissions'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar submissions del curso con filtros (ADMIN/PROFESSOR)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Lista de submissions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('studentId')),
    __param(2, (0, common_1.Query)('challengeId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('evaluationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listSubmissions", null);
__decorate([
    (0, common_1.Get)(':id/challenges/:challengeId/submissions'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar submissions por curso y challenge' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listSubmissionsByChallenge", null);
__decorate([
    (0, common_1.Get)(':id/my/submissions'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseGuards)(is_student_of_course_guard_1.IsStudentOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mis submissions en el curso (STUDENT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('evaluationId')),
    __param(3, (0, common_1.Query)('challengeId')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listMySubmissions", null);
__decorate([
    (0, common_1.Get)(':id/evaluations/:evaluationId/submissions'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseGuards)(is_student_of_course_guard_1.IsStudentOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar submissions de una evaluación específica del curso (STUDENT - solo propias)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('evaluationId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listMySubmissionsByEvaluation", null);
__decorate([
    (0, common_1.Delete)(':id/challenges'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Desasignar múltiples retos del curso (ADMIN/PROFESSOR del curso)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "unassignMultipleChallenges", null);
__decorate([
    (0, common_1.Delete)(':id/challenges/:challengeId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Desasignar reto del curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "unassignChallenge", null);
__decorate([
    (0, common_1.Delete)(':id/students/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Retirar estudiante del curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "removeStudent", null);
__decorate([
    (0, common_1.Delete)(':id/professors/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Retirar profesor del curso (ADMIN)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "removeProfessor", null);
__decorate([
    (0, common_1.Put)(':id/metadata'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar metadatos del curso (descripción, categoría, nivel, grupo, imagen)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateMetadata", null);
__decorate([
    (0, common_1.Get)(':id/lessons'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_student_of_course_guard_1.IsStudentOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar lecciones del curso ordenadas' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listLessons", null);
__decorate([
    (0, common_1.Post)(':id/lessons'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una lección en el curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Put)(':id/lessons/:lessonId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una lección' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)(':id/lessons/:lessonId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una lección' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Post)(':id/lessons/:lessonId/resources'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar recurso a una lección' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "addResource", null);
__decorate([
    (0, common_1.Delete)(':id/lessons/:lessonId/resources/:resourceId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar recurso de una lección' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Param)('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, common_1.UseGuards)(is_professor_of_course_guard_1.IsProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas del curso (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseStatistics", null);
__decorate([
    (0, common_1.Get)(':id/students/:studentId/statistics'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de un estudiante en el curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getStudentStatistics", null);
__decorate([
    (0, common_1.Get)(':id/evaluations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, common_1.UseGuards)(is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar evaluaciones del curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listEvaluations", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)('Courses'),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('courses'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map