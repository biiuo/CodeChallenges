"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChallengesToCourseUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class AddChallengesToCourseUseCase {
    courseRepo;
    challengeRepo;
    constructor(courseRepo, challengeRepo) {
        this.courseRepo = courseRepo;
        this.challengeRepo = challengeRepo;
    }
    async execute(input) {
        const course = await this.courseRepo.findById(input.courseId);
        if (!course) {
            throw new course_exceptions_1.CourseNotFoundException(input.courseId);
        }
        const challengesPromises = input.challengeIds.map((id) => this.challengeRepo.findById(id));
        const challenges = await Promise.all(challengesPromises);
        const notFoundChallenges = input.challengeIds.filter((id, index) => !challenges[index]);
        if (notFoundChallenges.length > 0) {
            throw new course_exceptions_1.ChallengeNotFoundException(`Challenges not found: ${notFoundChallenges.join(', ')}`);
        }
        const alreadyInCourse = [];
        const toAdd = [];
        for (const challengeId of input.challengeIds) {
            const isInCourse = await this.courseRepo.isChallengeInCourse(input.courseId, challengeId);
            if (isInCourse) {
                alreadyInCourse.push(challengeId);
            }
            else {
                toAdd.push(challengeId);
            }
        }
        if (toAdd.length > 0) {
            await this.courseRepo.addChallengesToCourse(input.courseId, toAdd);
        }
        return {
            message: toAdd.length > 0
                ? `Successfully added ${toAdd.length} challenge(s) to course`
                : 'No new challenges added',
            addedCount: toAdd.length,
            alreadyInCourse: alreadyInCourse,
        };
    }
}
exports.AddChallengesToCourseUseCase = AddChallengesToCourseUseCase;
//# sourceMappingURL=addchallengestocourse.usecase.js.map