"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllUsersUseCase = void 0;
class FindAllUsersUseCase {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute() {
        return this.userRepo.findAll();
    }
}
exports.FindAllUsersUseCase = FindAllUsersUseCase;
//# sourceMappingURL=getalluser.usecase.js.map