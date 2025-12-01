"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Challenge = exports.Difficulty = exports.ChallengeStatus = void 0;
var ChallengeStatus;
(function (ChallengeStatus) {
    ChallengeStatus["DRAFT"] = "DRAFT";
    ChallengeStatus["PUBLISHED"] = "PUBLISHED";
    ChallengeStatus["ARCHIVED"] = "ARCHIVED";
})(ChallengeStatus || (exports.ChallengeStatus = ChallengeStatus = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
class Challenge {
    id;
    title;
    description;
    difficulty;
    tags;
    timeLimit;
    memoryLimit;
    status;
    isPublic;
    authorId;
    testCases;
    constructor(id, title, description, difficulty, tags, timeLimit, memoryLimit, status, isPublic, authorId, testCases) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.tags = tags;
        this.timeLimit = timeLimit;
        this.memoryLimit = memoryLimit;
        this.status = status;
        this.isPublic = isPublic;
        this.authorId = authorId;
        this.testCases = testCases;
    }
}
exports.Challenge = Challenge;
//# sourceMappingURL=challenge.entity.js.map