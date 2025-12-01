"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCourseUseCase = void 0;
const common_1 = require("@nestjs/common");
class DeleteCourseUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(code) {
        const existing = await this.courseRepo.findByCode(code);
        if (!existing)
            throw new common_1.NotFoundException('Course not found');
        await this.courseRepo.delete(code);
    }
}
exports.DeleteCourseUseCase = DeleteCourseUseCase;
//# sourceMappingURL=deletecourse.usecase.js.map