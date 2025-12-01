"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseMapper = void 0;
const course_entity_1 = require("../../domain/entities/course.entity");
class CourseMapper {
    static toDomain(prismaCourse) {
        return new course_entity_1.Course(prismaCourse.id, prismaCourse.code, prismaCourse.name, prismaCourse.period);
    }
    static toPrisma(domainCourse) {
        return {
            id: domainCourse.id,
            code: domainCourse.code,
            name: domainCourse.name,
            period: domainCourse.period,
        };
    }
}
exports.CourseMapper = CourseMapper;
//# sourceMappingURL=course.mapper.js.map