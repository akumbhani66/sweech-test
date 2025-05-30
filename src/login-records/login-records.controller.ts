import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { LoginRecordsService } from './login-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('login-records')
export class LoginRecordsController {
  constructor(private loginRecordsService: LoginRecordsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getLoginHistory(@Request() req) {
    return this.loginRecordsService.getLoginHistory(req.user.id);
  }

  @Get('rankings')
  async getWeeklyRankings() {
    return this.loginRecordsService.getWeeklyRankings();
  }
}
