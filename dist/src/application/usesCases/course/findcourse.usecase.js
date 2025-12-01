"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindCourseByCodeUseCase = void 0;
const common_1 = require("@nestjs/common");
class FindCourseByCodeUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(code) {
        const c = await this.courseRepo.findByCode(code);
        if (!c)
            throw new common_1.NotFoundException('Course not found');
        return c;
    }
}
exports.FindCourseByCodeUseCase = FindCourseByCodeUseCase;
//# sourceMappingURL=findcourse.usecase.js.map