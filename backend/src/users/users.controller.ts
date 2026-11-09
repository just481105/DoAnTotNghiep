import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/dashboard-stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getDashboardStats(user.sub);
  }

  @Get('me/activity')
  @UseGuards(JwtAuthGuard)
  async getActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    const n = Math.min(Math.max(parseInt(days ?? '120', 10) || 120, 1), 366);
    return this.usersService.getActivity(user.sub, n);
  }
}
