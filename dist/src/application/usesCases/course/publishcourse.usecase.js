"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishCourseUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class PublishCourseUseCase {
    courseRepo;
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async execute(courseId, isPublished) {
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new course_exceptions_1.CourseNotFoundException(courseId);
        }
        await this.courseRepo.update(course.code, { isPublished });
        return {
            message: isPublished
                ? 'Course published successfully. Students can now enroll.'
                : 'Course unpublished successfully. New enrollments are disabled.',
            courseId,
            isPublished,
        };
    }
}
exports.PublishCourseUseCase = PublishCourseUseCase;
//# sourceMappingURL=publishcourse.usecase.js.map