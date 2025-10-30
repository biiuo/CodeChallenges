import { ConflictException, NotFoundException } from '@nestjs/common';

export class CourseAlreadyExistsException extends ConflictException {
  constructor(code: string) {
    super(`Course with code '${code}' already exists`);
  }
}

export class CourseNotFoundException extends NotFoundException {
  constructor(code: string) {
    super(`Course with code '${code}' not found`);
  }
}

export class InvalidProfessorsException extends ConflictException {
  constructor() {
    super('No valid professors found with the provided codes');
  }
}
