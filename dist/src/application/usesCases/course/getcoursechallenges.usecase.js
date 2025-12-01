"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCourseChallengesUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class GetCourseChallengesUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(courseId) {
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new course_exceptions_1.CourseNotFoundException(courseId);
        }
        const challenges = await this.courseRepo.findChallengesByCourseId(courseId);
        return challenges;
    }
}
exports.GetCourseChallengesUseCase = GetCourseChallengesUseCase;
//# sourceMappingURL=getcoursechallenges.usecase.js.map