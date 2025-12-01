"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesExtendedModule = void 0;
const common_1 = require("@nestjs/common");
const courses_controller_1 = require("../controllers/courses.controller");
const courses_cover_controller_1 = require("../controllers/courses-cover.controller");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const cloudinary_service_1 = require("../../infrastructure/cloudinary.service");
const roles_guard_1 = require("../guards/roles.guard");
const is_professor_of_course_guard_1 = require("../guards/is-professor-of-course.guard");
const is_student_of_course_guard_1 = require("../guards/is-student-of-course.guard");
const is_member_or_professor_of_course_guard_1 = require("../guards/is-member-or-professor-of-course.guard");
let CoursesExtendedModule = class CoursesExtendedModule {
};
exports.CoursesExtendedModule = CoursesExtendedModule;
exports.CoursesExtendedModule = CoursesExtendedModule = __decorate([
    (0, common_1.Module)({
        controllers: [courses_controller_1.CoursesController, courses_cover_controller_1.CoursesCoverController],
        providers: [
            prisma_service_1.PrismaService,
            cloudinary_service_1.CloudinaryService,
            roles_guard_1.RolesGuard,
            is_professor_of_course_guard_1.IsProfessorOfCourseGuard,
            is_student_of_course_guard_1.IsStudentOfCourseGuard,
            is_member_or_professor_of_course_guard_1.IsMemberOrProfessorOfCourseGuard
        ],
        exports: [prisma_service_1.PrismaService, cloudinary_service_1.CloudinaryService],
    })
], CoursesExtendedModule);
//# sourceMappingURL=courses-extended.module.js.map