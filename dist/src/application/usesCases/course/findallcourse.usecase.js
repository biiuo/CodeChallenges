"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllCoursesUseCase = void 0;
class FindAllCoursesUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute() {
        return this.courseRepo.findAll();
    }
}
exports.FindAllCoursesUseCase = FindAllCoursesUseCase;
//# sourceMappingURL=findallcourse.usecase.js.map