"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindSubmissionsByUserUseCase = void 0;
class FindSubmissionsByUserUseCase {
    submissionRepo;
    constructor(submissionRepo) {
        this.submissionRepo = submissionRepo;
    }
    async execute(userId) {
        return this.submissionRepo.findByUser(userId);
    }
}
exports.FindSubmissionsByUserUseCase = FindSubmissionsByUserUseCase;
//# sourceMappingURL=findbyuser.usecase.js.map