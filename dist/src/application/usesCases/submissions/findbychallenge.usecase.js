"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindSubmissionsByChallengeUseCase = void 0;
class FindSubmissionsByChallengeUseCase {
    submissionRepo;
    constructor(submissionRepo) {
        this.submissionRepo = submissionRepo;
    }
    async execute(challengeId) {
        return this.submissionRepo.findByChallenge(challengeId);
    }
}
exports.FindSubmissionsByChallengeUseCase = FindSubmissionsByChallengeUseCase;
//# sourceMappingURL=findbychallenge.usecase.js.map