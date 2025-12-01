import { OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly redis;
    constructor(redis: Redis);
    onModuleDestroy(): Promise<void>;
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<number>;
    publish(channel: string, message: unknown): Promise<number>;
}
