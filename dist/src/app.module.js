"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const db_module_1 = require("./presentation/modules/db.module");
const user_module_1 = require("./presentation/modules/user.module");
const challenge_module_1 = require("./presentation/modules/challenge.module");
const auth_module_1 = require("./presentation/modules/auth.module");
const submission_module_1 = require("./presentation/modules/submission.module");
const courses_extended_module_1 = require("./presentation/modules/courses-extended.module");
const challenges_extended_module_1 = require("./presentation/modules/challenges-extended.module");
const evaluations_module_1 = require("./presentation/modules/evaluations.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const runner_module_1 = require("./infrastructure/runners/runner.module");
const observability_module_1 = require("./infrastructure/observability/observability.module");
const metrics_controller_1 = require("./presentation/controllers/metrics.controller");
const admin_controller_1 = require("./presentation/controllers/admin.controller");
const prisma_module_1 = require("./infrastructure/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.CoreModule,
            user_module_1.UserModule,
            challenge_module_1.ChallengeModule,
            auth_module_1.AuthModule,
            submission_module_1.SubmissionModule,
            courses_extended_module_1.CoursesExtendedModule,
            challenges_extended_module_1.ChallengesExtendedModule,
            evaluations_module_1.EvaluationsModule,
            redis_module_1.RedisModule,
            runner_module_1.RunnerModule,
            observability_module_1.ObservabilityModule,
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => ({
                    store: await (0, cache_manager_redis_yet_1.redisStore)({
                        url: process.env.REDIS_URL,
                        ttl: 0,
                    }),
                }),
            }),
            prisma_module_1.PrismaModule,
        ],
        controllers: [app_controller_1.AppController, metrics_controller_1.MetricsController, admin_controller_1.AdminController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map