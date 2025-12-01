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
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
class CreateChallengeDto {
    title;
    description;
    difficulty;
    tags;
    timeLimit;
    memoryLimit;
    isPublic;
}
class UpdateChallengeDto {
    title;
    description;
    difficulty;
    tags;
    timeLimit;
    memoryLimit;
    status;
    isPublic;
}
let ChallengesController = class ChallengesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, req) {
        const userId = req.user.userId;
        return this.prisma.challenge.create({
            data: {
                ...dto,
                authorId: userId
            }
        });
    }
    async list() {
        return this.prisma.challenge.findMany();
    }
    async get(id) {
        return this.prisma.challenge.findUnique({ where: { id } });
    }
    async update(id, dto) {
        return this.prisma.challenge.update({ where: { id }, data: { ...dto } });
    }
    async remove(id) {
        return this.prisma.challenge.delete({ where: { id } });
    }
    async listTestcases(id, req) {
        const role = req.user?.role;
        if (role === 'STUDENT') {
            return this.prisma.testcase.findMany({ where: { challengeId: id, visible: true } });
        }
        return this.prisma.testcase.findMany({ where: { challengeId: id } });
    }
    async addTestcases(id, cases) {
        for (const c of cases) {
            await this.prisma.testcase.upsert({
                where: { challengeId_caseNumber: { challengeId: id, caseNumber: c.caseNumber } },
                update: { input: c.input, output: c.output, visible: c.visible ?? false },
                create: { challengeId: id, caseNumber: c.caseNumber, input: c.input, output: c.output, visible: c.visible ?? false },
            });
        }
        return { ok: true };
    }
    async deleteTestcase(id, caseNumber) {
        await this.prisma.testcase.delete({ where: { challengeId_caseNumber: { challengeId: id, caseNumber: Number(caseNumber) } } });
        return { ok: true };
    }
    async publish(id) {
        return this.prisma.challenge.update({ where: { id }, data: { status: 'PUBLISHED' } });
    }
    async archive(id) {
        return this.prisma.challenge.update({ where: { id }, data: { status: 'ARCHIVED' } });
    }
    async assignToCourse(id, courseId) {
        return this.prisma.challenge.update({ where: { id }, data: { courses: { connect: { id: courseId } } } });
    }
    async unassignFromCourse(id, courseId) {
        return this.prisma.challenge.update({ where: { id }, data: { courses: { disconnect: { id: courseId } } } });
    }
};
exports.ChallengesController = ChallengesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear challenge (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateChallengeDto, Object]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar challenges' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener challenge por id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar challenge (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateChallengeDto]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar challenge (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/testcases'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar testcases por challenge (oculta invisible para STUDENT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "listTestcases", null);
__decorate([
    (0, common_1.Post)(':id/testcases'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir testcases (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "addTestcases", null);
__decorate([
    (0, common_1.Delete)(':id/testcases/:caseNumber'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar testcase (ADMIN/PROFESSOR)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('caseNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "deleteTestcase", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Publicar challenge' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Archivar challenge' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/assign-course/:courseId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar challenge a curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "assignToCourse", null);
__decorate([
    (0, common_1.Delete)(':id/assign-course/:courseId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Desasignar challenge de curso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChallengesController.prototype, "unassignFromCourse", null);
exports.ChallengesController = ChallengesController = __decorate([
    (0, swagger_1.ApiTags)('Challenges'),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('challenges'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChallengesController);
//# sourceMappingURL=challenges.controller.js.map