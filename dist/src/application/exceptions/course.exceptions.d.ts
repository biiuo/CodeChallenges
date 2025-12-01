import { ConflictException, NotFoundException } from '@nestjs/common';
export declare class CourseAlreadyExistsException extends ConflictException {
    constructor(code: string);
}
export declare class CourseNotFoundException extends NotFoundException {
    constructor(codeOrId: string);
}
export declare class InvalidProfessorsException extends ConflictException {
    constructor();
}
export declare class ChallengeNotFoundException extends NotFoundException {
    constructor(message: string);
}
