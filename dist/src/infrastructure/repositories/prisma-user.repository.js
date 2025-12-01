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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const user_entity_1 = require("../../domain/entities/user.entity");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const created = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: data.passwordHash,
                name: data.name,
                role: data.role ?? user_entity_1.Role.STUDENT,
            }
        });
        return this.toDomain(created);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.toDomain(user) : null;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.toDomain(user) : null;
    }
    async findByUsername(username) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        return user ? this.toDomain(user) : null;
    }
    async findAll() {
        const users = await this.prisma.user.findMany();
        return users.map(user => this.toDomain(user));
    }
    async update(id, data) {
        const updated = await this.prisma.user.update({
            where: { id: data.id },
            data: {
                username: data.username,
                email: data.email,
                password: data.passwordHash,
                name: data.name,
                role: data.role,
            }
        });
        return this.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.user.delete({ where: { id } });
    }
    async findByRole(role) {
        const users = await this.prisma.user.findMany({
            where: { role }
        });
        return users.map(user => this.toDomain(user));
    }
    toDomain(prismaUser) {
        return new user_entity_1.User(prismaUser.id, prismaUser.name, prismaUser.username, prismaUser.email, prismaUser.password, prismaUser.role);
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map