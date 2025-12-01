"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteChallengeUseCase = void 0;
const common_1 = require("@nestjs/common");
class DeleteChallengeUseCase {
    challengeRepository;
    constructor(challengeRepository) {
        this.challengeRepository = challengeRepository;
    }
    async execute(id) {
        const challenge = await this.challengeRepository.findById(id);
        if (!challenge)
            throw new common_1.NotFoundException('Challenge not found');
        await this.challengeRepository.delete(id);
    }
}
exports.DeleteChallengeUseCase = DeleteChallengeUseCase;
//# sourceMappingURL=deletechallenge.usecase.js.map