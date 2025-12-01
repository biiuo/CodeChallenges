"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidChallengeDataException = exports.ChallengeAccessDeniedException = exports.ChallengeNotFoundException = exports.ChallengeTitleAlreadyExistsException = void 0;
const common_1 = require("@nestjs/common");
class ChallengeTitleAlreadyExistsException extends common_1.ConflictException {
    constructor(title) {
        super(`Challenge with title '${title}' already exists. Please choose a different title.`);
    }
}
exports.ChallengeTitleAlreadyExistsException = ChallengeTitleAlreadyExistsException;
class ChallengeNotFoundException extends common_1.NotFoundException {
    constructor(identifier) {
        super(`Challenge with identifier '${identifier}' not found.`);
    }
}
exports.ChallengeNotFoundException = ChallengeNotFoundException;
class ChallengeAccessDeniedException extends common_1.ConflictException {
    constructor(action) {
        super(`Access denied. You don't have permission to ${action} this challenge.`);
    }
}
exports.ChallengeAccessDeniedException = ChallengeAccessDeniedException;
class InvalidChallengeDataException extends common_1.ConflictException {
    constructor(message) {
        super(`Invalid challenge data: ${message}`);
    }
}
exports.InvalidChallengeDataException = InvalidChallengeDataException;
//# sourceMappingURL=challenge.exceptions.js.map