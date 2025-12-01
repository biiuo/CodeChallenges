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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const swagger_1 = require("@nestjs/swagger");
const tokens_1 = require("../../application/tokens");
const user_entity_1 = require("../../domain/entities/user.entity");
const crypto_1 = require("crypto");
class UserProfileDoc {
    userId;
    role;
}
let UsersController = class UsersController {
    userRepository;
    hasher;
    constructor(userRepository, hasher) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }
    async getAll() {
        const users = await this.userRepository.findAll();
        return users.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role
        }));
    }
    async update(id, body) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (body.email && body.email !== user.email) {
            const existing = await this.userRepository.findByEmail(body.email);
            if (existing) {
                throw new common_1.BadRequestException('Email already used');
            }
        }
        const updateData = {};
        if (body.name)
            updateData.name = body.name;
        if (body.username)
            updateData.username = body.username;
        if (body.email)
            updateData.email = body.email;
        if (body.role)
            updateData.role = this.parseRole(body.role);
        if (body.password)
            updateData.passwordHash = await this.hasher.hash(body.password);
        updateData.id = id;
        const updated = await this.userRepository.update(id, updateData);
        return {
            id: updated.id,
            name: updated.name,
            username: updated.username,
            email: updated.email,
            role: updated.role
        };
    }
    async create(body) {
        const existing = await this.userRepository.findByEmail(body.email);
        if (existing) {
            throw new common_1.BadRequestException('Email already used');
        }
        const roleValue = this.parseRole(body.role);
        const hash = await this.hasher.hash(body.password);
        const user = new user_entity_1.User((0, crypto_1.randomUUID)(), body.name, body.username, body.email, hash, roleValue);
        const userData = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role
        };
        const created = await this.userRepository.create(userData);
        return {
            id: created.id,
            name: created.name,
            username: created.username,
            email: created.email,
            role: created.role
        };
    }
    async delete(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.delete(id);
        return { message: 'User deleted successfully' };
    }
    async me(req) {
        const user = await this.userRepository.findById(req.user.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
        };
    }
    parseRole(value) {
        if (user_entity_1.Role[value] !== undefined)
            return user_entity_1.Role[value];
        const key = Object.keys(user_entity_1.Role).find(k => k.toUpperCase() === value.toUpperCase());
        if (key)
            return user_entity_1.Role[key];
        throw new common_1.BadRequestException(`Invalid role: ${value}`);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Admin only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'List of all users' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user (Admin only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Admin only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user (Admin only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Devuelve la información básica del usuario extraída del token JWT. Requiere un token de acceso válido en el encabezado **Authorization: Bearer &lt;token&gt;**.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Perfil del usuario autenticado',
        type: UserProfileDoc,
        schema: {
            example: {
                userId: '00001111-2222-3333-4444-555566667777',
                role: 'STUDENT'
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Token inválido o no proporcionado',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "me", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)('access'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.HASHER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], UsersController);
//# sourceMappingURL=user.controller.js.map