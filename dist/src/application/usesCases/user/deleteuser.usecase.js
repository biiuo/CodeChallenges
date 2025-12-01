"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const common_1 = require("@nestjs/common");
class DeleteUserUseCase {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(id) {
        const existing = await this.userRepo.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        await this.userRepo.delete(id);
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
//# sourceMappingURL=deleteuser.usecase.js.map