import { RedisService } from 'src/infrastructure/redis/redis.service';
export declare class AppService {
    private readonly redis;
    constructor(redis: RedisService);
    getUserCached(id: string): Promise<{}>;
    getHello(): string;
}
