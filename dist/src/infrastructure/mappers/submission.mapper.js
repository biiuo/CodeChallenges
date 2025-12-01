"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionMapper = void 0;
const submission_entity_1 = require("../../domain/entities/submission.entity");
const enum_mapper_1 = require("./enum.mapper");
class SubmissionMapper {
    static toDomain(prismaSubmission) {
        return new submission_entity_1.Submission({
            id: prismaSubmission.id,
            language: prismaSubmission.language,
            code: prismaSubmission.code,
            status: enum_mapper_1.EnumMapper.toDomainSubmissionStatus(prismaSubmission.status),
            score: prismaSubmission.score ?? undefined,
            timeMsTotal: prismaSubmission.timeMsTotal ?? undefined,
            createdAt: prismaSubmission.createdAt,
            userId: prismaSubmission.userId,
            challengeId: prismaSubmission.challengeId,
        });
    }
    static toPrisma(domainSubmission) {
        return {
            id: domainSubmission.id,
            language: domainSubmission.language,
            code: domainSubmission.code,
            status: enum_mapper_1.EnumMapper.toPrismaSubmissionStatus(domainSubmission.status),
            score: domainSubmission.score ?? null,
            timeMsTotal: domainSubmission.timeMsTotal ?? null,
            userId: domainSubmission.userId,
            challengeId: domainSubmission.challengeId,
        };
    }
}
exports.SubmissionMapper = SubmissionMapper;
//# sourceMappingURL=submission.mapper.js.map