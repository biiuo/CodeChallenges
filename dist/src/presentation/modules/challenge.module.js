"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeModule = void 0;
const common_1 = require("@nestjs/common");
const challenge_controller_1 = require("../controllers/challenge.controller");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const prisma_challenge_repository_1 = require("../../infrastructure/repositories/prisma-challenge.repository");
const createchallenge_usecase_1 = require("../../application/usesCases/challenge/createchallenge.usecase");
const findallchallenges_usecase_1 = require("../../application/usesCases/challenge/findallchallenges.usecase");
const findchallengebyid_usecase_1 = require("../../application/usesCases/challenge/findchallengebyid.usecase");
const updatechallenge_usecase_1 = require("../../application/usesCases/challenge/updatechallenge.usecase");
const deletechallenge_usecase_1 = require("../../application/usesCases/challenge/deletechallenge.usecase");
const tokens_1 = require("../../application/tokens");
const usePrisma = !!process.env.DATABASE_URL;
let ChallengeModule = class ChallengeModule {
};
exports.ChallengeModule = ChallengeModule;
exports.ChallengeModule = ChallengeModule = __decorate([
    (0, common_1.Module)({
        controllers: [challenge_controller_1.ChallengesController],
        providers: [
            ...([prisma_service_1.PrismaService]),
            {
                provide: tokens_1.CHALLENGE_REPOSITORY,
                useFactory: (prisma) => {
                    return new prisma_challenge_repository_1.PrismaChallengeRepository(prisma);
                },
                inject: usePrisma ? [prisma_service_1.PrismaService] : [],
            },
            {
                provide: createchallenge_usecase_1.CreateChallengeUseCase,
                useFactory: (repo) => new createchallenge_usecase_1.CreateChallengeUseCase(repo),
                inject: [tokens_1.CHALLENGE_REPOSITORY]
            },
            {
                provide: deletechallenge_usecase_1.DeleteChallengeUseCase,
                useFactory: (repo) => new deletechallenge_usecase_1.DeleteChallengeUseCase(repo),
                inject: [tokens_1.CHALLENGE_REPOSITORY]
            },
            {
                provide: findallchallenges_usecase_1.FindAllChallengesUseCase,
                useFactory: (repo) => new findallchallenges_usecase_1.FindAllChallengesUseCase(repo),
                inject: [tokens_1.CHALLENGE_REPOSITORY]
            },
            {
                provide: findchallengebyid_usecase_1.FindChallengeByIdUseCase,
                useFactory: (repo) => new findchallengebyid_usecase_1.FindChallengeByIdUseCase(repo),
                inject: [tokens_1.CHALLENGE_REPOSITORY]
            },
            {
                provide: updatechallenge_usecase_1.UpdateChallengeUseCase,
                useFactory: (repo) => new updatechallenge_usecase_1.UpdateChallengeUseCase(repo),
                inject: [tokens_1.CHALLENGE_REPOSITORY]
            },
        ],
    })
], ChallengeModule);
//# sourceMappingURL=challenge.module.js.map