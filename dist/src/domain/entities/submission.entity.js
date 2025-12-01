"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = exports.SubmissionStatus = void 0;
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["QUEUED"] = "QUEUED";
    SubmissionStatus["RUNNING"] = "RUNNING";
    SubmissionStatus["ACCEPTED"] = "ACCEPTED";
    SubmissionStatus["WRONG_ANSWER"] = "WRONG_ANSWER";
    SubmissionStatus["TIME_LIMIT_EXCEEDED"] = "TIME_LIMIT_EXCEEDED";
    SubmissionStatus["COMPILATION_ERROR"] = "COMPILATION_ERROR";
    SubmissionStatus["RUNTIME_ERROR"] = "RUNTIME_ERROR";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
class Submission {
    id;
    language;
    code;
    status;
    score;
    timeMsTotal;
    createdAt;
    userId;
    challengeId;
    constructor(props) {
        Object.assign(this, props);
    }
}
exports.Submission = Submission;
//# sourceMappingURL=submission.entity.js.map