import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatDto, WritingDto } from './dto/ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChatDto) {
    return this.aiService.chat(user.sub, dto);
  }

  @Post('writing')
  writing(@CurrentUser() user: AuthenticatedUser, @Body() dto: WritingDto) {
    return this.aiService.evaluateWriting(user.sub, dto);
  }
}
