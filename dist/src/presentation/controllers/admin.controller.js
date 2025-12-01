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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserActivity(userId, courseId, challengeId, status, from, to) {
        const whereSubmission = { userId };
        if (challengeId)
            whereSubmission.challengeId = challengeId;
        if (status)
            whereSubmission.status = status;
        if (from || to) {
            whereSubmission.createdAt = {};
            if (from)
                whereSubmission.createdAt.gte = new Date(from);
            if (to)
                whereSubmission.createdAt.lte = new Date(to);
        }
        const submissions = await this.prisma.submission.findMany({
            where: whereSubmission,
            orderBy: { createdAt: 'desc' },
            include: {
                challenge: true,
                testResults: true,
            },
        });
        let filtered = submissions;
        if (courseId) {
            filtered = submissions.filter((s) => s.challenge?.courseId === courseId);
        }
        const byChallenge = {};
        for (const s of filtered) {
            const cid = s.challengeId;
            const attempts = byChallenge[cid]?.attempts ?? 0;
            const bestScore = Math.max(byChallenge[cid]?.bestScore ?? 0, s.score ?? 0);
            byChallenge[cid] = {
                challengeId: cid,
                challengeTitle: s.challenge?.title,
                attempts: attempts + 1,
                lastStatus: s.status,
                bestScore,
                lastSubmittedAt: s.createdAt,
            };
        }
        return {
            userId,
            filters: { courseId, challengeId, status, from, to },
            totals: {
                submissions: filtered.length,
                attempts: filtered.length,
                passed: filtered.filter((s) => s.status === client_1.SubmissionStatus.ACCEPTED).length,
                failed: filtered.filter((s) => s.status !== client_1.SubmissionStatus.ACCEPTED).length,
            },
            challenges: Object.values(byChallenge),
            submissions: filtered.map((s) => ({
                id: s.id,
                challengeId: s.challengeId,
                challengeTitle: s.challenge?.title,
                status: s.status,
                score: s.score ?? 0,
                createdAt: s.createdAt,
                testCasesCount: s.testResults?.length ?? 0,
            })),
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users/:id/activity'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Query)('challengeId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserActivity", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map