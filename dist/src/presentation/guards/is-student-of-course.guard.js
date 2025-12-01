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
exports.IsStudentOfCourseGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
let IsStudentOfCourseGuard = class IsStudentOfCourseGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const userId = req.user?.userId;
        const courseId = req.params?.id || req.params?.courseId;
        if (!userId || !courseId)
            throw new common_1.ForbiddenException('Missing user or course');
        const enrollment = await this.prisma.courseStudent.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment)
            throw new common_1.ForbiddenException('Not enrolled in this course');
        return true;
    }
};
exports.IsStudentOfCourseGuard = IsStudentOfCourseGuard;
exports.IsStudentOfCourseGuard = IsStudentOfCourseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IsStudentOfCourseGuard);
//# sourceMappingURL=is-student-of-course.guard.js.map