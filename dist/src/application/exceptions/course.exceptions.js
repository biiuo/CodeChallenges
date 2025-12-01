"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeNotFoundException = exports.InvalidProfessorsException = exports.CourseNotFoundException = exports.CourseAlreadyExistsException = void 0;
const common_1 = require("@nestjs/common");
class CourseAlreadyExistsException extends common_1.ConflictException {
    constructor(code) {
        super(`Course with code '${code}' already exists`);
    }
}
exports.CourseAlreadyExistsException = CourseAlreadyExistsException;
class CourseNotFoundException extends common_1.NotFoundException {
    constructor(codeOrId) {
        super(`Course with identifier '${codeOrId}' not found`);
    }
}
exports.CourseNotFoundException = CourseNotFoundException;
class InvalidProfessorsException extends common_1.ConflictException {
    constructor() {
        super('No valid professors found with the provided codes');
    }
}
exports.InvalidProfessorsException = InvalidProfessorsException;
class ChallengeNotFoundException extends common_1.NotFoundException {
    constructor(message) {
        super(message);
    }
}
exports.ChallengeNotFoundException = ChallengeNotFoundException;
//# sourceMappingURL=course.exceptions.js.map