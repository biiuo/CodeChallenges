"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCourseUseCase = void 0;
const common_1 = require("@nestjs/common");
class UpdateCourseUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(code, data) {
        const existing = await this.courseRepo.findByCode(code);
        if (!existing)
            throw new common_1.NotFoundException('Course not found');
        return this.courseRepo.update(code, data);
    }
}
exports.UpdateCourseUseCase = UpdateCourseUseCase;
//# sourceMappingURL=updatecourse.usecase.js.map