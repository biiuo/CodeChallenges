import { Module } from '@nestjs/common';
//import { CategoryModule } from './presentation/modules/category.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './module/db.module';
import { UserModule } from './module/user.module';
import { CourseModule } from './module/course.module';
import { ChallengeModule} from './module/challenge.module';
import { AuthModule } from './module/auth.module';

@Module({
  imports: [ 
    CoreModule,
    UserModule,
    CourseModule,
    ChallengeModule,
    AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}