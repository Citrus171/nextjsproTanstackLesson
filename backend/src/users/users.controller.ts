import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserProfileDto })
  async getMe(@CurrentUser() user: { id: number }): Promise<UserProfileDto> {
    const { password: _password, ...profile } = await this.usersService.findById(user.id);
    return profile;
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'パスワード変更成功' })
  async changePassword(
    @CurrentUser() user: { id: number },
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
