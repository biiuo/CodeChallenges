"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModule = void 0;
const common_1 = require("@nestjs/common");
const course_controller_1 = require("../controllers/course.controller");
const prisma_service_1 = require("../../infrastructure/persistence/prisma.service");
const prisma_course_repository_1 = require("../../infrastructure/repositories/prisma-course.repository");
const prisma_user_repository_1 = require("../../infrastructure/repositories/prisma-user.repository");
const prisma_challenge_repository_1 = require("../../infrastructure/repositories/prisma-challenge.repository");
const createcourse_usecase_1 = require("../../application/usesCases/course/createcourse.usecase");
const findcourse_usecase_1 = require("../../application/usesCases/course/findcourse.usecase");
const findallcourse_usecase_1 = require("../../application/usesCases/course/findallcourse.usecase");
const updatecourse_usecase_1 = require("../../application/usesCases/course/updatecourse.usecase");
const deletecourse_usecase_1 = require("../../application/usesCases/course/deletecourse.usecase");
const addchallengestocourse_usecase_1 = require("../../application/usesCases/course/addchallengestocourse.usecase");
const removechallengesfromcourse_usecase_1 = require("../../application/usesCases/course/removechallengesfromcourse.usecase");
const getcoursechallenges_usecase_1 = require("../../application/usesCases/course/getcoursechallenges.usecase");
const getcoursestatistics_usecase_1 = require("../../application/usesCases/course/getcoursestatistics.usecase");
const clonechallengstocourse_usecase_1 = require("../../application/usesCases/course/clonechallengstocourse.usecase");
const publishcourse_usecase_1 = require("../../application/usesCases/course/publishcourse.usecase");
const tokens_1 = require("../../application/tokens");
const roles_guard_1 = require("../guards/roles.guard");
const usePrisma = !!process.env.DATABASE_URL;
let CourseModule = class CourseModule {
};
exports.CourseModule = CourseModule;
exports.CourseModule = CourseModule = __decorate([
    (0, common_1.Module)({
        controllers: [course_controller_1.CoursesController],
        providers: [
            ...([prisma_service_1.PrismaService]),
            {
                provide: tokens_1.COURSE_REPOSITORY,
                useFactory: (prisma) => {
                    return new prisma_course_repository_1.PrismaCourseRepository(prisma);
                },
                inject: usePrisma ? [prisma_service_1.PrismaService] : [],
            },
            {
                provide: tokens_1.USER_REPOSITORY,
                useFactory: (prisma) => {
                    return new prisma_user_repository_1.PrismaUserRepository(prisma);
                },
                inject: usePrisma ? [prisma_service_1.PrismaService] : [],
            },
            {
                provide: createcourse_usecase_1.CreateCourseUseCase,
                useFactory: (courseRepo, userRepo) => new createcourse_usecase_1.CreateCourseUseCase(courseRepo, userRepo),
                inject: [tokens_1.COURSE_REPOSITORY, tokens_1.USER_REPOSITORY]
            },
            {
                provide: deletecourse_usecase_1.DeleteCourseUseCase,
                useFactory: (repo) => new deletecourse_usecase_1.DeleteCourseUseCase(repo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: findallcourse_usecase_1.FindAllCoursesUseCase,
                useFactory: (repo) => new findallcourse_usecase_1.FindAllCoursesUseCase(repo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: findcourse_usecase_1.FindCourseByCodeUseCase,
                useFactory: (repo) => new findcourse_usecase_1.FindCourseByCodeUseCase(repo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: updatecourse_usecase_1.UpdateCourseUseCase,
                useFactory: (repo) => new updatecourse_usecase_1.UpdateCourseUseCase(repo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: tokens_1.CHALLENGE_REPOSITORY,
                useFactory: (prisma) => {
                    return new prisma_challenge_repository_1.PrismaChallengeRepository(prisma);
                },
                inject: usePrisma ? [prisma_service_1.PrismaService] : [],
            },
            {
                provide: addchallengestocourse_usecase_1.AddChallengesToCourseUseCase,
                useFactory: (courseRepo, challengeRepo) => new addchallengestocourse_usecase_1.AddChallengesToCourseUseCase(courseRepo, challengeRepo),
                inject: [tokens_1.COURSE_REPOSITORY, tokens_1.CHALLENGE_REPOSITORY]
            },
            {
                provide: removechallengesfromcourse_usecase_1.RemoveChallengesFromCourseUseCase,
                useFactory: (courseRepo) => new removechallengesfromcourse_usecase_1.RemoveChallengesFromCourseUseCase(courseRepo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: getcoursechallenges_usecase_1.GetCourseChallengesUseCase,
                useFactory: (courseRepo) => new getcoursechallenges_usecase_1.GetCourseChallengesUseCase(courseRepo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: getcoursestatistics_usecase_1.GetCourseStatisticsUseCase,
                useFactory: (courseRepo, prisma) => new getcoursestatistics_usecase_1.GetCourseStatisticsUseCase(courseRepo, prisma),
                inject: [tokens_1.COURSE_REPOSITORY, prisma_service_1.PrismaService]
            },
            {
                provide: clonechallengstocourse_usecase_1.CloneChallengesToCourseUseCase,
                useFactory: (courseRepo) => new clonechallengstocourse_usecase_1.CloneChallengesToCourseUseCase(courseRepo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            {
                provide: publishcourse_usecase_1.PublishCourseUseCase,
                useFactory: (courseRepo) => new publishcourse_usecase_1.PublishCourseUseCase(courseRepo),
                inject: [tokens_1.COURSE_REPOSITORY]
            },
            roles_guard_1.RolesGuard,
        ],
    })
], CourseModule);
//# sourceMappingURL=course.module.js.map