"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const enum_mapper_1 = require("./enum.mapper");
class UserMapper {
    static toDomain(prismaUser) {
        return new user_entity_1.User(prismaUser.id, prismaUser.name, prismaUser.username, prismaUser.email, prismaUser.password, enum_mapper_1.EnumMapper.toDomainRole(prismaUser.role));
    }
    static toPrisma(domainUser) {
        return {
            id: domainUser.id,
            name: domainUser.name,
            username: domainUser.username,
            email: domainUser.email,
            password: domainUser.passwordHash,
            role: enum_mapper_1.EnumMapper.toPrismaRole(domainUser.role),
        };
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map