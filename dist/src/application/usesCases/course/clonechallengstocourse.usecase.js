"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneChallengesToCourseUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class CloneChallengesToCourseUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(input) {
        const [sourceCourse, targetCourse] = await Promise.all([
            this.courseRepo.findById(input.sourceCourseId),
            this.courseRepo.findById(input.targetCourseId),
        ]);
        if (!sourceCourse) {
            throw new course_exceptions_1.CourseNotFoundException(input.sourceCourseId);
        }
        if (!targetCourse) {
            throw new course_exceptions_1.CourseNotFoundException(input.targetCourseId);
        }
        const sourceChallenges = await this.courseRepo.findChallengesByCourseId(input.sourceCourseId);
        if (sourceChallenges.length === 0) {
            return {
                message: 'Source course has no challenges to clone',
                clonedCount: 0,
                skippedCount: 0,
            };
        }
        const challengeIds = sourceChallenges.map((c) => c.id);
        const alreadyInTarget = [];
        const toClone = [];
        for (const challengeId of challengeIds) {
            const exists = await this.courseRepo.isChallengeInCourse(input.targetCourseId, challengeId);
            if (exists) {
                alreadyInTarget.push(challengeId);
            }
            else {
                toClone.push(challengeId);
            }
        }
        if (toClone.length > 0) {
            await this.courseRepo.addChallengesToCourse(input.targetCourseId, toClone);
        }
        return {
            message: `Successfully cloned ${toClone.length} challenge(s) from source course to target course`,
            clonedCount: toClone.length,
            skippedCount: alreadyInTarget.length,
        };
    }
}
exports.CloneChallengesToCourseUseCase = CloneChallengesToCourseUseCase;
//# sourceMappingURL=clonechallengstocourse.usecase.js.map