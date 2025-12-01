"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersInfraModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma.module");
const prisma_user_repository_1 = require("./repositories/prisma-user.repository");
const argon2_hasher_1 = require("./crypto/argon2.hasher");
const tokens_1 = require("../application/tokens");
let UsersInfraModule = class UsersInfraModule {
};
exports.UsersInfraModule = UsersInfraModule;
exports.UsersInfraModule = UsersInfraModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            { provide: tokens_1.USER_REPOSITORY, useClass: prisma_user_repository_1.PrismaUserRepository },
            { provide: tokens_1.HASHER_REPOSITORY, useClass: argon2_hasher_1.Argon2Hasher },
        ],
        exports: [tokens_1.USER_REPOSITORY, tokens_1.HASHER_REPOSITORY],
    })
], UsersInfraModule);
//# sourceMappingURL=users-infra.module.js.map