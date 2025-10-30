import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';


@Injectable()
export class AppService {
  constructor(private readonly redis: RedisService) {}

  async getUserCached(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    // TODO: carga real (p.ej. de Prisma)
    const user = { id, name: 'Demo' };

    await this.redis.set(cacheKey, user, 60); // cache 60s
    return user;
  }
  getHello(): string {
    return 'Hello world!';
  }
}
