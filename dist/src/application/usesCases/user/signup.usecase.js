"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupUseCase = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
class SignupUseCase {
    users;
    hasher;
    idGen;
    constructor(users, hasher, idGen) {
        this.users = users;
        this.hasher = hasher;
        this.idGen = idGen;
    }
    async execute(input) {
        const roleValue = input.role
            ? (typeof input.role === 'string' ? this.parseRole(input.role) : input.role)
            : user_entity_1.Role.STUDENT;
        const existing = await this.users.findByEmail(input.email);
        if (existing)
            throw new Error('Email already used');
        const hash = await this.hasher.hash(input.password);
        const candidate = new user_entity_1.User(this.idGen(), input.name, input.username, input.email, hash, roleValue);
        const created = await this.users.create(candidate);
        return created;
    }
    parseRole(value) {
        if (user_entity_1.Role[value] !== undefined)
            return user_entity_1.Role[value];
        const key = Object.keys(user_entity_1.Role).find(k => k.toUpperCase() === value.toUpperCase());
        if (key)
            return user_entity_1.Role[key];
        throw new Error(`Invalid role: ${value}`);
    }
}
exports.SignupUseCase = SignupUseCase;
//# sourceMappingURL=signup.usecase.js.map