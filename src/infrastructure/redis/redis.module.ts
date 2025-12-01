import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { REDIS_CLIENT } from 'src/application/tokens';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisHost = config.get('NODE_ENV') === 'development' ? 'redis' : config.get('REDIS_HOST', '127.0.0.1');
        const redisPort = parseInt(config.get('REDIS_PORT', '6379'), 10);
        
        console.log(`🔧 Redis connecting to: ${redisHost}:${redisPort}`);
        
        const client = new Redis({
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
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}