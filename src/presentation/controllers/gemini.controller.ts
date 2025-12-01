import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Controller('gemini')
@UseGuards(AuthGuard('jwt'))
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    const response = await this.geminiService.generateResponse(message);
    return { response };
  }
}
