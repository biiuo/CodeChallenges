import { ConflictException, NotFoundException } from '@nestjs/common';

export class ChallengeTitleAlreadyExistsException extends ConflictException {
  constructor(title: string) {
    super(`Challenge with title '${title}' already exists. Please choose a different title.`);
  }
}

export class ChallengeNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Challenge with identifier '${identifier}' not found.`);
  }
}

export class ChallengeAccessDeniedException extends ConflictException {
  constructor(action: string) {
    super(`Access denied. You don't have permission to ${action} this challenge.`);
  }
}

export class InvalidChallengeDataException extends ConflictException {
  constructor(message: string) {
    super(`Invalid challenge data: ${message}`);
  }
}
