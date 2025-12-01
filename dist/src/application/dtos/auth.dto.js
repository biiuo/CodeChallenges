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
exports.TokenResponse = exports.LoginRequest = exports.SignupRequest = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SignupRequest {
    email;
    password;
    name;
    username;
    role;
}
exports.SignupRequest = SignupRequest;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'estudiante@universidad.edu', description: 'Correo electrónico del usuario' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SignupRequest.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MiPassword123!', description: 'Contraseña (mínimo 6 caracteres)', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], SignupRequest.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'María García', description: 'Nombre completo del usuario' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupRequest.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'maria.garcia', description: 'Nombre de usuario único' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupRequest.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STUDENT', description: 'Rol del usuario (default: STUDENT)', enum: ['STUDENT', 'PROFESSOR', 'ADMIN'], required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SignupRequest.prototype, "role", void 0);
class LoginRequest {
    email;
    password;
}
exports.LoginRequest = LoginRequest;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'estudiante@universidad.edu', description: 'Correo electrónico' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginRequest.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MiPassword123!', description: 'Contraseña', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginRequest.prototype, "password", void 0);
class TokenResponse {
    access;
    refresh;
}
exports.TokenResponse = TokenResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token de acceso JWT' }),
    __metadata("design:type", String)
], TokenResponse.prototype, "access", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token de refresco JWT' }),
    __metadata("design:type", String)
], TokenResponse.prototype, "refresh", void 0);
//# sourceMappingURL=auth.dto.js.map