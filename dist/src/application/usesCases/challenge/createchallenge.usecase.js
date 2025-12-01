"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChallengeUseCase = void 0;
const challenge_entity_1 = require("../../../domain/entities/challenge.entity");
const challenge_exceptions_1 = require("../../exceptions/challenge.exceptions");
const common_1 = require("@nestjs/common");
class CreateChallengeUseCase {
    challengeRepo;
    logger = new common_1.Logger(CreateChallengeUseCase.name);
    constructor(challengeRepo) {
        this.challengeRepo = challengeRepo;
    }
    async execute(dto) {
        const existingChallenge = await this.challengeRepo.findByTitle(dto.title);
        if (existingChallenge) {
            throw new challenge_exceptions_1.ChallengeTitleAlreadyExistsException(dto.title);
        }
        if (!dto.authorId) {
            throw new Error('authorId is required but was not provided');
        }
        const challenge = new challenge_entity_1.Challenge(this.generateChallengeId(), dto.title, dto.description, dto.difficulty || 'EASY', (dto.tags && dto.tags.length > 0) ? dto.tags : ['general'], dto.timeLimit, dto.memoryLimit, dto.status ? dto.status : challenge_entity_1.ChallengeStatus.DRAFT, dto.isPublic ?? false, dto.authorId, dto.testcases?.map(tc => ({
            caseNumber: tc.caseNumber,
            input: tc.input,
            output: tc.output,
            visible: tc.visible ?? true,
            createdAt: new Date()
        })));
        return this.challengeRepo.create(challenge);
    }
    generateChallengeId(length = 5) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = 'CH-';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.logger.debug(`Generated challenge id: ${result}`);
        return result;
    }
}
exports.CreateChallengeUseCase = CreateChallengeUseCase;
//# sourceMappingURL=createchallenge.usecase.js.map