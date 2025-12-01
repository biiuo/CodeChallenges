import { ConflictException, NotFoundException } from '@nestjs/common';

export class CourseAlreadyExistsException extends ConflictException {
  constructor(code: string) {
    super(`Course with code '${code}' already exists`);
  }
}

export class CourseNotFoundException extends NotFoundException {
  constructor(codeOrId: string) {
    super(`Course with identifier '${codeOrId}' not found`);
  }
}

export class InvalidProfessorsException extends ConflictException {
  constructor() {
    super('No valid professors found with the provided codes');
  }
}

export class ChallengeNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}
