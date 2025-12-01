"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSubmissionUseCase = void 0;
const common_1 = require("@nestjs/common");
class DeleteSubmissionUseCase {
    submissionRepo;
    constructor(submissionRepo) {
        this.submissionRepo = submissionRepo;
    }
    async execute(id) {
        const existing = await this.submissionRepo.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Submission not found');
        await this.submissionRepo.delete(id);
    }
}
exports.DeleteSubmissionUseCase = DeleteSubmissionUseCase;
//# sourceMappingURL=deletesubmission.usecase.js.map