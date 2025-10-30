import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('ping')
@UseInterceptors(CacheInterceptor)
export class PingController {
  @Get()
  @CacheKey('ping:hello')
  @CacheTTL(30) // segundos
  hello() {
    return { ok: true, at: Date.now() };
  }
}