"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindUserByIdUseCase = void 0;
const common_1 = require("@nestjs/common");
class FindUserByIdUseCase {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(id) {
        const u = await this.userRepo.findById(id);
        if (!u)
            throw new common_1.NotFoundException('User not found');
        return u;
    }
}
exports.FindUserByIdUseCase = FindUserByIdUseCase;
//# sourceMappingURL=getuser.usecase.js.map