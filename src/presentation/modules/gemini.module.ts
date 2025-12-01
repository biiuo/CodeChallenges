import { Module } from '@nestjs/common';
import { GeminiController } from '../controllers/gemini.controller';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
