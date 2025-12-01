"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
class Course {
    id;
    code;
    name;
    period;
    description;
    category;
    level;
    group;
    coverImage;
    isPublished;
    createdAt;
    updatedAt;
    constructor(id, code, name, period, description, category, level, group, coverImage, isPublished, createdAt, updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.period = period;
        this.description = description;
        this.category = category;
        this.level = level;
        this.group = group;
        this.coverImage = coverImage;
        this.isPublished = isPublished;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Course = Course;
//# sourceMappingURL=course.entity.js.map