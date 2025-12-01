"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindChallengeByIdUseCase = void 0;
const common_1 = require("@nestjs/common");
class FindChallengeByIdUseCase {
    challengeRepo;
    constructor(challengeRepo) {
        this.challengeRepo = challengeRepo;
    }
    async execute(id) {
        const ch = await this.challengeRepo.findById(id);
        if (!ch)
            throw new common_1.NotFoundException('Challenge not found');
        return ch;
    }
}
exports.FindChallengeByIdUseCase = FindChallengeByIdUseCase;
//# sourceMappingURL=findchallengebyid.usecase.js.map