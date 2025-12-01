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
exports.IsChallengeOfCourseGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
let IsChallengeOfCourseGuard = class IsChallengeOfCourseGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const courseId = req.params?.id || req.params?.courseId;
        const challengeId = req.params?.challengeId;
        if (!courseId || !challengeId)
            throw new common_1.ForbiddenException('Missing course or challenge');
        const exists = await this.prisma.challenge.findFirst({
            where: { id: challengeId, courses: { some: { id: courseId } } },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.ForbiddenException('Challenge not assigned to course');
        return true;
    }
};
exports.IsChallengeOfCourseGuard = IsChallengeOfCourseGuard;
exports.IsChallengeOfCourseGuard = IsChallengeOfCourseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IsChallengeOfCourseGuard);
//# sourceMappingURL=is-challenge-of-course.guard.js.map