import { Controller, Get, UseGuards } from '@nestjs/common';
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

}
