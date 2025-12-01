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
exports.UpdateChallengeDto = exports.CreateChallengeDto = exports.CreateTestCaseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
class CreateTestCaseDto {
    caseNumber;
    input;
    output;
    visible;
}
exports.CreateTestCaseDto = CreateTestCaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Número del caso de prueba'
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTestCaseDto.prototype, "caseNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2 7 11 15\n9',
        description: 'Entrada del caso de prueba'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestCaseDto.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0 1',
        description: 'Salida esperada del caso de prueba'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestCaseDto.prototype, "output", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Si el caso de prueba es visible para el usuario',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTestCaseDto.prototype, "visible", void 0);
class CreateChallengeDto {
    title;
    description;
    difficulty;
    tags;
    timeLimit;
    memoryLimit;
    authorId;
    status;
    isPublic;
    testcases;
}
exports.CreateChallengeDto = CreateChallengeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Two Sum',
        description: 'Título del reto'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChallengeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target.\n\nInput:\n- Primera línea: los números del array separados por espacio.\n- Segunda línea: el valor target.\n\nOutput:\n- Los dos índices separados por espacio (orden ascendente).',
        description: 'Descripción detallada del problema'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChallengeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: challenge_entity_1.Difficulty,
        example: challenge_entity_1.Difficulty.EASY,
        description: 'Nivel de dificultad del reto',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(challenge_entity_1.Difficulty),
    __metadata("design:type", String)
], CreateChallengeDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['arrays', 'hash-table'],
        description: 'Etiquetas temáticas del reto',
        type: [String],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateChallengeDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1000,
        description: 'Tiempo límite en milisegundos'
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateChallengeDto.prototype, "timeLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 128,
        description: 'Límite de memoria en MB'
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateChallengeDto.prototype, "memoryLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cm123abc456def789',
        description: 'ID del autor que crea el reto (se extrae automáticamente del token JWT)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChallengeDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: challenge_entity_1.ChallengeStatus,
        example: challenge_entity_1.ChallengeStatus.DRAFT,
        description: 'Estado del reto',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(challenge_entity_1.ChallengeStatus),
    __metadata("design:type", String)
], CreateChallengeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Si el reto es público o no',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChallengeDto.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CreateTestCaseDto],
        example: [
            { caseNumber: 1, input: '5 3', output: '8', visible: true },
            { caseNumber: 2, input: '10 20', output: '30', visible: false }
        ],
        description: 'Casos de prueba del reto',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateTestCaseDto),
    __metadata("design:type", Array)
], CreateChallengeDto.prototype, "testcases", void 0);
class UpdateChallengeDto {
    title;
    description;
    difficulty;
    tags;
    timeLimit;
    memoryLimit;
    status;
    courseCode;
    solutionCode;
    solutionLanguage;
}
exports.UpdateChallengeDto = UpdateChallengeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: challenge_entity_1.Difficulty,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(challenge_entity_1.Difficulty),
    __metadata("design:type", Object)
], UpdateChallengeDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateChallengeDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateChallengeDto.prototype, "timeLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateChallengeDto.prototype, "memoryLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: challenge_entity_1.ChallengeStatus,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(challenge_entity_1.ChallengeStatus),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "courseCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Código de solución de referencia'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "solutionCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Lenguaje del código de solución (python, javascript, cpp, java)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChallengeDto.prototype, "solutionLanguage", void 0);
//# sourceMappingURL=challenges.js.map