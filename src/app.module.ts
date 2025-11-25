import { Module } from '@nestjs/common';
//import { CategoryModule } from './presentation/modules/category.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './presentation/modules/db.module';
import { UserModule } from './presentation/modules/user.module';
import { CourseModule } from './presentation/modules/course.module';
import { ChallengeModule} from './presentation/modules/challenge.module';
import { AuthModule } from './presentation/modules/auth.module';
import { SubmissionModule } from './presentation/modules/submission.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RunnerModule } from './infrastructure/runners/runner.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';
import { MetricsController } from './presentation/controllers/metrics.controller';

@Module({
  imports: [ 
    CoreModule,
    UserModule,
    CourseModule,
    ChallengeModule,
    AuthModule,
    SubmissionModule,
    RedisModule,
    RunnerModule,
    ObservabilityModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL, // respeta .env
          // ttl por defecto (ms). Puedes dejarlo sin ttl y controlar por @CacheTTL
          ttl: 0,
        }),
      }),
    }),
  ],
  
  controllers: [AppController, MetricsController],
  providers: [AppService],
})
export class AppModule {}