"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllChallengesUseCase = void 0;
class FindAllChallengesUseCase {
    challengeRepo;
    constructor(challengeRepo) {
        this.challengeRepo = challengeRepo;
    }
    async execute() {
        return this.challengeRepo.findAll();
    }
}
exports.FindAllChallengesUseCase = FindAllChallengesUseCase;
//# sourceMappingURL=findallchallenges.usecase.js.map