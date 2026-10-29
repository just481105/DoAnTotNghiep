import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/dashboard-stats')
  async getDashboardStats(@Query('userId') userId?: string) {
    const defaultUserId = userId || 'e6de30ce-ac04-487f-b376-163240602f84';
    return this.usersService.getDashboardStats(defaultUserId);
  }

  @Post('me/speaking-history')
  async recordSpeakingHistory(
    @Body()
    body: {
      userId?: string;
      word: string;
      accuracyScore: number;
      transcribedText?: string;
    },
  ) {
    const targetUserId = body.userId || 'e6de30ce-ac04-487f-b376-163240602f84';
    return this.usersService.recordSpeakingPractice(targetUserId, body);
  }
}
