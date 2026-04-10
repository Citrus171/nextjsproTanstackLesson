import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@UseGuards(UserJwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: { id: number }) {
    const { password, ...profile } = await this.usersService.findById(user.id);
    return profile;
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: { id: number },
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
