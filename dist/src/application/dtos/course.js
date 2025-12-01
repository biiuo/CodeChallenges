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
exports.RemoveChallengesToCourseDTO = exports.AddChallengesToCourseDTO = exports.UpdateCourseDto = exports.CreateCourseDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCourseDTO {
    code;
    name;
    period;
    description;
    category;
    level;
    group;
    coverImage;
    isPublished;
    professorCode;
}
exports.CreateCourseDTO = CreateCourseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROG101', description: 'Código único del curso' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Introducción a la Programación', description: 'Nombre del curso' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-1', description: 'Período académico' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Curso introductorio para aprender los fundamentos de la programación',
        description: 'Descripción del curso',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'web-development',
        description: 'Categoría del curso: web-development, data-science, algorithms, etc.',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'beginner',
        description: 'Nivel del curso: beginner, intermediate, advanced',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: 'Grupo o sección del curso',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/image.jpg',
        description: 'URL de la imagen de portada del curso',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indica si el curso está publicado y visible',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCourseDTO.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['PROF001', 'PROF002'],
        description: 'Códigos de profesores asignados',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseDTO.prototype, "professorCode", void 0);
class UpdateCourseDto {
    code;
    name;
    period;
    description;
    category;
    level;
    group;
    coverImage;
    isPublished;
    professorCode;
}
exports.UpdateCourseDto = UpdateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCourseDto.prototype, "professorCode", void 0);
class AddChallengesToCourseDTO {
    challengeIds;
}
exports.AddChallengesToCourseDTO = AddChallengesToCourseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['CH-ABCDE', 'CH-FGHIJ'],
        description: 'Array de IDs de los challenges a agregar al curso'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AddChallengesToCourseDTO.prototype, "challengeIds", void 0);
class RemoveChallengesToCourseDTO {
    challengeIds;
}
exports.RemoveChallengesToCourseDTO = RemoveChallengesToCourseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['CH-ABCDE', 'CH-FGHIJ'],
        description: 'Array de IDs de los challenges a remover del curso'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RemoveChallengesToCourseDTO.prototype, "challengeIds", void 0);
//# sourceMappingURL=course.js.map