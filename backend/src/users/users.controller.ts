import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OrderSummaryDto } from './dto/order-summary.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
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

  @Put('me')
  @ApiOkResponse({ type: UserProfileDto })
  async updateProfile(
    @CurrentUser() user: { id: number },
    @Body() body: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const { password: _password, ...profile } = await this.usersService.updateProfile(
      user.id,
      body.name,
      body.address,
    );
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

  @Get('me/orders')
  @ApiOkResponse({ type: [OrderSummaryDto] })
  async getOrders(@CurrentUser() user: { id: number }): Promise<OrderSummaryDto[]> {
    const orders = await this.usersService.findOrdersByUserId(user.id);
    return orders.map(({ id, status, totalAmount, createdAt }) => ({
      id,
      status,
      totalAmount,
      createdAt,
    }));
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'アカウント退会成功' })
  async withdraw(@CurrentUser() user: { id: number }): Promise<void> {
    await this.usersService.withdraw(user.id);
  }
}
