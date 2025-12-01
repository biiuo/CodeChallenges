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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_dto_1 = require("../../application/dtos/auth.dto");
const common_2 = require("@nestjs/common");
const tokens_1 = require("../../application/tokens");
const signup_usecase_1 = require("../../application/usesCases/user/signup.usecase");
const login_usecase_1 = require("../../application/usesCases/user/login.usecase");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../decorators/roles.decorator");
const roles_guard_1 = require("../guards/roles.guard");
const swagger_1 = require("@nestjs/swagger");
class AuthTokensDoc {
    access;
    refresh;
}
let AuthController = class AuthController {
    jwt;
    usersRepo;
    hasher;
    constructor(jwt, usersRepo, hasher) {
        this.jwt = jwt;
        this.usersRepo = usersRepo;
        this.hasher = hasher;
    }
    async signup(dto) {
        try {
            const uc = new signup_usecase_1.SignupUseCase(this.usersRepo, this.hasher, () => crypto.randomUUID());
            const user = await uc.execute({
                email: dto.email,
                password: dto.password,
                name: dto.name,
                username: dto.username,
                role: dto.role
            });
            return this.signTokens(user.id, user.role);
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err?.message ?? 'Internal server error');
        }
    }
    async login(dto) {
        const uc = new login_usecase_1.LoginUseCase(this.usersRepo, this.hasher);
        try {
            const user = await uc.execute({ email: dto.email, password: dto.password });
            return this.signTokens(user.id, user.role);
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
    }
    async refresh(req) {
        return this.signTokens(req.user.userId, req.user.role);
    }
    async signTokens(userId, role) {
        const payload = {
            sub: userId,
            role: role
        };
        const [access, refresh] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m'
            }),
            this.jwt.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d'
            }),
        ]);
        return { access, refresh };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Registro de usuario' }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.SignupRequest,
        examples: {
            student: {
                summary: 'Registro de Estudiante',
                value: {
                    email: 'estudiante@universidad.edu',
                    password: 'Estudiante123!',
                    name: 'María García',
                    code: 'EST2025001',
                    username: 'maria.garcia',
                    role: 'STUDENT'
                },
            },
            professor: {
                summary: 'Registro de Profesor',
                value: {
                    email: 'profesor@universidad.edu',
                    password: 'Profesor456!',
                    name: 'Dr. Carlos Ruiz',
                    code: 'PROF2025001',
                    username: 'carlos.ruiz',
                    role: 'PROFESSOR'
                },
            },
            admin: {
                summary: 'Registro de Administrador',
                value: {
                    email: 'admin@universidad.edu',
                    password: 'Admin789!',
                    name: 'Ana Pérez',
                    code: 'ADM2025001',
                    username: 'ana.perez',
                    role: 'ADMIN'
                },
            }
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Usuario creado y tokens firmados',
        type: AuthTokensDoc,
        schema: {
            example: {
                access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupRequest]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Inicio de sesión' }),
    (0, swagger_1.ApiBody)({
        type: auth_dto_1.LoginRequest,
        examples: {
            student: {
                summary: 'Login de Estudiante',
                value: { email: 'estudiante@universidad.edu', password: 'Estudiante123!' },
            },
            professor: {
                summary: 'Login de Profesor',
                value: { email: 'profesor@universidad.edu', password: 'Profesor456!' },
            },
            admin: {
                summary: 'Login de Administrador',
                value: { email: 'admin@universidad.edu', password: 'Admin789!' },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Login exitoso',
        type: AuthTokensDoc,
        schema: {
            example: {
                access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Credenciales inválidas' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginRequest]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-refresh'), roles_guard_1.RolesGuard),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({
        summary: 'Refrescar tokens',
        description: 'Requiere un **Refresh Token** válido (por header Authorization: Bearer <refresh>).',
    }),
    (0, swagger_1.ApiBearerAuth)('refresh'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tokens renovados',
        type: AuthTokensDoc,
        schema: {
            example: {
                access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Refresh token inválido o expirado' }),
    (0, roles_decorator_1.Roles)('ADMIN', 'PROFESSOR', 'STUDENT'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __param(1, (0, common_2.Inject)(tokens_1.USER_REPOSITORY)),
    __param(2, (0, common_2.Inject)(tokens_1.HASHER_REPOSITORY)),
    __metadata("design:paramtypes", [jwt_1.JwtService, Object, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map