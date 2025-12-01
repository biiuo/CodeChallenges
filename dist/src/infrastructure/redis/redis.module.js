"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_service_1 = require("./redis.service");
const tokens_1 = require("../../application/tokens");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true })],
        providers: [
            {
                provide: tokens_1.REDIS_CLIENT,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const redisHost = config.get('NODE_ENV') === 'development' ? 'redis' : config.get('REDIS_HOST', '127.0.0.1');
                    const redisPort = parseInt(config.get('REDIS_PORT', '6379'), 10);
                    console.log(`🔧 Redis connecting to: ${redisHost}:${redisPort}`);
                    const client = new ioredis_1.default({
                        host: redisHost,
                        port: redisPort,
                        lazyConnect: false,
                        maxRetriesPerRequest: 3,
                        connectTimeout: 10000,
                    });
                    client.on('connect', () => console.log('✅ Redis connected successfully'));
                    client.on('error', (err) => console.error('❌ Redis error:', err.message));
                    return client;
                },
            },
            redis_service_1.RedisService,
        ],
        exports: [tokens_1.REDIS_CLIENT, redis_service_1.RedisService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map