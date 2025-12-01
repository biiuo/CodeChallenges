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
exports.IsProfessorOfCourseGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
let IsProfessorOfCourseGuard = class IsProfessorOfCourseGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const courseId = req.params?.id || req.params?.courseId;
        console.log('[IsProfessorOfCourseGuard] userId:', userId, 'userRole:', userRole, 'courseId:', courseId);
        if (!userId || !courseId) {
            console.log('[IsProfessorOfCourseGuard] Missing user or course');
            throw new common_1.ForbiddenException('Missing user or course');
        }
        if (userRole === 'ADMIN')
            return true;
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { professors: { select: { id: true } } },
        });
        console.log('[IsProfessorOfCourseGuard] course:', course);
        if (!course) {
            console.log('[IsProfessorOfCourseGuard] Course not found for id:', courseId);
            throw new common_1.ForbiddenException('Course not found');
        }
        const isProfessor = course.professors.some(p => p.id === userId);
        console.log('[IsProfessorOfCourseGuard] isProfessor:', isProfessor);
        if (!isProfessor) {
            console.log('[IsProfessorOfCourseGuard] Not a professor of this course:', courseId, 'for user:', userId);
            throw new common_1.ForbiddenException('Not a professor of this course');
        }
        return true;
    }
};
exports.IsProfessorOfCourseGuard = IsProfessorOfCourseGuard;
exports.IsProfessorOfCourseGuard = IsProfessorOfCourseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IsProfessorOfCourseGuard);
//# sourceMappingURL=is-professor-of-course.guard.js.map