"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubmissionStatusUseCase = void 0;
const common_1 = require("@nestjs/common");
class UpdateSubmissionStatusUseCase {
    submissionRepo;
    constructor(submissionRepo) {
        this.submissionRepo = submissionRepo;
    }
    async execute(id, status, score, timeMsTotal) {
        const existing = await this.submissionRepo.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Submission not found');
        return this.submissionRepo.update(id, { status, score, timeMsTotal });
    }
}
exports.UpdateSubmissionStatusUseCase = UpdateSubmissionStatusUseCase;
//# sourceMappingURL=updatesubmission.usecase.js.map