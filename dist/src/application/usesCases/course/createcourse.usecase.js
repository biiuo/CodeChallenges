"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCourseUseCase = void 0;
const course_entity_1 = require("../../../domain/entities/course.entity");
const course_exceptions_1 = require("../../exceptions/course.exceptions");
const crypto_1 = require("crypto");
class CreateCourseUseCase {
    courseRepo;
    userRepo;
    constructor(courseRepo, userRepo) {
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }
    async execute(dto) {
        const existing = await this.courseRepo.findByCode(dto.code);
        if (existing)
            throw new course_exceptions_1.CourseAlreadyExistsException(dto.code);
        let professorIds = [];
        if (dto.professorCode && dto.professorCode.length > 0) {
            const professors = await Promise.all(dto.professorCode.map((id) => this.userRepo.findById(id)));
            professorIds = professors
                .filter((p) => p !== null)
                .map((p) => p.id);
            if (professorIds.length === 0) {
                throw new course_exceptions_1.InvalidProfessorsException();
            }
        }
        const course = new course_entity_1.Course((0, crypto_1.randomUUID)(), dto.code, dto.name, dto.period);
        const createdCourse = await this.courseRepo.createWithProfessors(course, professorIds);
        return createdCourse;
    }
}
exports.CreateCourseUseCase = CreateCourseUseCase;
//# sourceMappingURL=createcourse.usecase.js.map