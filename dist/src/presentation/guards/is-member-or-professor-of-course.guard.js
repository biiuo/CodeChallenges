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
exports.IsMemberOrProfessorOfCourseGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
let IsMemberOrProfessorOfCourseGuard = class IsMemberOrProfessorOfCourseGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const courseId = req.params?.id || req.params?.courseId;
        if (!userId || !courseId) {
            throw new common_1.ForbiddenException('Missing user or course');
        }
        if (userRole === 'ADMIN')
            return true;
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { professors: { select: { id: true } }, students: { select: { userId: true } } },
        });
        if (!course) {
            throw new common_1.ForbiddenException('Course not found');
        }
        const isProfessor = course.professors.some(p => p.id === userId);
        const isStudent = course.students.some(s => s.userId === userId);
        if (!isProfessor && !isStudent) {
            throw new common_1.ForbiddenException('Not a member or professor of this course');
        }
        return true;
    }
};
exports.IsMemberOrProfessorOfCourseGuard = IsMemberOrProfessorOfCourseGuard;
exports.IsMemberOrProfessorOfCourseGuard = IsMemberOrProfessorOfCourseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IsMemberOrProfessorOfCourseGuard);
//# sourceMappingURL=is-member-or-professor-of-course.guard.js.map