"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = normalize;
exports.compareOutputs = compareOutputs;
exports.truncateOutput = truncateOutput;
function normalize(text) {
    if (!text)
        return '';
    return text.replace(/\r/g, '').trim().replace(/\s+$/, '');
}
function compareOutputs(studentOutput, expectedOutput) {
    const student = normalize(studentOutput);
    const expected = normalize(expectedOutput);
    if (student === expected) {
        return 'OK';
    }
    const studentLines = student.split('\n').map((l) => l.trimEnd());
    const expectedLines = expected.split('\n').map((l) => l.trimEnd());
    if (studentLines.length !== expectedLines.length) {
        return 'WRONG_ANSWER';
    }
    for (let i = 0; i < studentLines.length; i++) {
        if (studentLines[i] !== expectedLines[i]) {
            return 'WRONG_ANSWER';
        }
    }
    return 'OK';
}
function truncateOutput(text, maxLength = 10240) {
    if (!text)
        return '';
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + '\n... (output truncated)';
}
//# sourceMappingURL=output-utils.js.map