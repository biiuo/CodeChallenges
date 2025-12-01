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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCourseRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const course_mapper_1 = require("../mappers/course.mapper");
let PrismaCourseRepository = class PrismaCourseRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(course) {
        const created = await this.prisma.course.create({
            data: {
                code: course.code,
                name: course.name,
                period: course.period,
                description: course.description,
                category: course.category,
                level: course.level,
                group: course.group,
                coverImage: course.coverImage,
                isPublished: course.isPublished ?? false,
            },
        });
        return course_mapper_1.CourseMapper.toDomain(created);
    }
    async createWithProfessors(course, professorIds) {
        const created = await this.prisma.course.create({
            data: {
                code: course.code,
                name: course.name,
                period: course.period,
                description: course.description,
                category: course.category,
                level: course.level,
                group: course.group,
                coverImage: course.coverImage,
                isPublished: course.isPublished ?? false,
                professors: {
                    connect: professorIds.map((id) => ({ id })),
                },
            },
            include: { professors: true },
        });
        return course_mapper_1.CourseMapper.toDomain(created);
    }
    async findById(id) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        return course ? course_mapper_1.CourseMapper.toDomain(course) : null;
    }
    async findByCode(code) {
        const course = await this.prisma.course.findUnique({ where: { code: code } });
        return course ? course_mapper_1.CourseMapper.toDomain(course) : null;
    }
    async findAll() {
        const courses = await this.prisma.course.findMany();
        return courses.map(course_mapper_1.CourseMapper.toDomain);
    }
    async update(code, data) {
        const updated = await this.prisma.course.update({
            where: { code },
            data,
        });
        return course_mapper_1.CourseMapper.toDomain(updated);
    }
    async delete(code) {
        await this.prisma.course.delete({ where: { code } });
    }
    async addChallengesToCourse(courseId, challengeIds) {
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                challenges: {
                    connect: challengeIds.map((id) => ({ id })),
                },
            },
        });
    }
    async removeChallengesFromCourse(courseId, challengeIds) {
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                challenges: {
                    disconnect: challengeIds.map((id) => ({ id })),
                },
            },
        });
    }
    async findChallengesByCourseId(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                challenges: {
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
                },
            },
        });
        return course?.challenges || [];
    }
    async isChallengeInCourse(courseId, challengeId) {
        const course = await this.prisma.course.findFirst({
            where: {
                id: courseId,
                challenges: {
                    some: { id: challengeId },
                },
            },
        });
        return !!course;
    }
};
exports.PrismaCourseRepository = PrismaCourseRepository;
exports.PrismaCourseRepository = PrismaCourseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCourseRepository);
//# sourceMappingURL=prisma-course.repository.js.map