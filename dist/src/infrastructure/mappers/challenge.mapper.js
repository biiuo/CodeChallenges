"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeMapper = void 0;
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const enum_mapper_1 = require("./enum.mapper");
const challenge_entity_2 = require("../../domain/entities/challenge.entity");
class ChallengeMapper {
    static toDomain(prismaChallenge) {
        const testCases = prismaChallenge.testcases?.map(tc => ({
            challengeId: tc.challengeId,
            caseNumber: tc.caseNumber,
            input: tc.input,
            output: tc.output,
            visible: tc.visible,
            createdAt: tc.createdAt,
        }));
        const challenge = new challenge_entity_1.Challenge(prismaChallenge.id, prismaChallenge.title, prismaChallenge.description, enum_mapper_1.EnumMapper.toDomainDifficulty(prismaChallenge.difficulty) ?? challenge_entity_2.Difficulty.EASY, prismaChallenge.tags, prismaChallenge.timeLimit, prismaChallenge.memoryLimit, enum_mapper_1.EnumMapper.toDomainChallengeStatus(prismaChallenge.status), prismaChallenge.isPublic, prismaChallenge.authorId, testCases);
        if (prismaChallenge.solutionCode) {
            challenge.solutionCode = prismaChallenge.solutionCode;
        }
        if (prismaChallenge.solutionLanguage) {
            challenge.solutionLanguage = prismaChallenge.solutionLanguage;
        }
        return challenge;
    }
    static toPrisma(domainChallenge) {
        return {
            id: domainChallenge.id,
            title: domainChallenge.title,
            description: domainChallenge.description,
            difficulty: enum_mapper_1.EnumMapper.toPrismaDifficulty(domainChallenge.difficulty),
            tags: domainChallenge.tags,
            timeLimit: domainChallenge.timeLimit,
            memoryLimit: domainChallenge.memoryLimit,
            status: enum_mapper_1.EnumMapper.toPrismaChallengeStatus(domainChallenge.status),
            authorId: domainChallenge.authorId,
        };
    }
}
exports.ChallengeMapper = ChallengeMapper;
//# sourceMappingURL=challenge.mapper.js.map