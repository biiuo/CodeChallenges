import { ConflictException, NotFoundException } from '@nestjs/common';
export declare class ChallengeTitleAlreadyExistsException extends ConflictException {
    constructor(title: string);
}
export declare class ChallengeNotFoundException extends NotFoundException {
    constructor(identifier: string);
}
export declare class ChallengeAccessDeniedException extends ConflictException {
    constructor(action: string);
}
export declare class InvalidChallengeDataException extends ConflictException {
    constructor(message: string);
}
