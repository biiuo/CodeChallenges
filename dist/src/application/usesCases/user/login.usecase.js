"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
class LoginUseCase {
    users;
    hasher;
    constructor(users, hasher) {
        this.users = users;
        this.hasher = hasher;
    }
    async execute(input) {
        const u = await this.users.findByEmail(input.email);
        if (!u)
            throw new Error('Invalid credentials');
        const ok = await this.hasher.verify(u.passwordHash, input.password);
        if (!ok)
            throw new Error('Invalid credentials');
        return u;
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.usecase.js.map