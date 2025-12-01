"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubmissionStatusDto = exports.SubmissionResponseDto = exports.CreateSubmissionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSubmissionDto {
    language;
    code;
    challengeId;
}
exports.CreateSubmissionDto = CreateSubmissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'python',
        description: 'Lenguaje de programación',
        enum: ['python', 'javascript', 'cpp', 'java']
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubmissionDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'print("Hello World")',
        description: 'Código fuente de la solución'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubmissionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CH-ABCDE',
        description: 'ID del reto a resolver'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubmissionDto.prototype, "challengeId", void 0);
class SubmissionResponseDto {
    id;
    userId;
    challengeId;
    code;
    language;
    status;
    score;
    timeMsTotal;
    createdAt;
}
exports.SubmissionResponseDto = SubmissionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 123,
        description: 'ID único del submission'
    }),
    __metadata("design:type", Number)
], SubmissionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '00001111-2222-3333-4444-555566667777',
        description: 'ID del usuario que realizó el submission'
    }),
    __metadata("design:type", String)
], SubmissionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CH-ABCDE',
        description: 'ID del reto'
    }),
    __metadata("design:type", String)
], SubmissionResponseDto.prototype, "challengeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'print("Hello World")',
        description: 'Código fuente enviado'
    }),
    __metadata("design:type", String)
], SubmissionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'python',
        description: 'Lenguaje de programación',
        enum: ['python', 'javascript', 'cpp', 'java']
    }),
    __metadata("design:type", String)
], SubmissionResponseDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'QUEUED',
        description: 'Estado del submission',
        enum: ['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR']
    }),
    __metadata("design:type", String)
], SubmissionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'Puntaje obtenido (0-100)'
    }),
    __metadata("design:type", Number)
], SubmissionResponseDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'Tiempo total de ejecución en milisegundos'
    }),
    __metadata("design:type", Number)
], SubmissionResponseDto.prototype, "timeMsTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-11-25T23:45:30.000Z',
        description: 'Fecha de creación del submission'
    }),
    __metadata("design:type", Date)
], SubmissionResponseDto.prototype, "createdAt", void 0);
class UpdateSubmissionStatusDto {
    status;
    score;
    timeMsTotal;
}
exports.UpdateSubmissionStatusDto = UpdateSubmissionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ACCEPTED',
        description: 'Estado del submission',
        enum: ['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR']
    }),
    (0, class_validator_1.IsEnum)(['QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR']),
    __metadata("design:type", String)
], UpdateSubmissionStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Puntaje obtenido (0-100)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSubmissionStatusDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1450, description: 'Tiempo total de ejecución en milisegundos', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSubmissionStatusDto.prototype, "timeMsTotal", void 0);
//# sourceMappingURL=submission.js.map