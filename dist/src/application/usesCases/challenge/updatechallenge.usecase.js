"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChallengeUseCase = void 0;
const challenge_exceptions_1 = require("../../exceptions/challenge.exceptions");
class UpdateChallengeUseCase {
    challengeRepo;
    constructor(challengeRepo) {
        this.challengeRepo = challengeRepo;
    }
    async execute(id, dto) {
        const existingChallenge = await this.challengeRepo.findById(id);
        if (!existingChallenge) {
            throw new challenge_exceptions_1.ChallengeNotFoundException(id);
        }
        if (dto.title && dto.title !== existingChallenge.title) {
            const duplicateChallenge = await this.challengeRepo.findByTitle(dto.title);
            if (duplicateChallenge && duplicateChallenge.id !== id) {
                throw new challenge_exceptions_1.ChallengeTitleAlreadyExistsException(dto.title);
            }
        }
        const cleanDto = {
            ...dto,
            difficulty: dto.difficulty ?? undefined,
        };
        return this.challengeRepo.update(id, cleanDto);
    }
}
exports.UpdateChallengeUseCase = UpdateChallengeUseCase;
//# sourceMappingURL=updatechallenge.usecase.js.map