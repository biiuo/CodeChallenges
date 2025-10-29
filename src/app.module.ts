import { Module } from '@nestjs/common';
//import { CategoryModule } from './presentation/modules/category.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './presentation/modules/db.module';
import { UserModule } from './presentation/modules/user.module';
import { CourseModule } from './presentation/modules/course.module';
import { ChallengeModule} from './presentation/modules/challenge.module';
import { AuthModule } from './presentation/modules/auth.module';

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