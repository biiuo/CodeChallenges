"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveChallengesFromCourseUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class RemoveChallengesFromCourseUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(input) {
        const course = await this.courseRepo.findById(input.courseId);
        if (!course) {
            throw new course_exceptions_1.CourseNotFoundException(input.courseId);
        }
        const toRemove = [];
        for (const challengeId of input.challengeIds) {
            const isInCourse = await this.courseRepo.isChallengeInCourse(input.courseId, challengeId);
            if (isInCourse) {
                toRemove.push(challengeId);
            }
        }
        if (toRemove.length > 0) {
            await this.courseRepo.removeChallengesFromCourse(input.courseId, toRemove);
        }
        return {
            message: toRemove.length > 0
                ? `Successfully removed ${toRemove.length} challenge(s) from course`
                : 'No challenges were removed',
            removedCount: toRemove.length,
        };
    }
}
exports.RemoveChallengesFromCourseUseCase = RemoveChallengesFromCourseUseCase;
//# sourceMappingURL=removechallengesfromcourse.usecase.js.map