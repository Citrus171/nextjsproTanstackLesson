import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@ApiTags('admin/accounts')
@Controller('admin/accounts')
export class AdminAccountsController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  async create(@Body() dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    return this.adminUsersService.create(dto.name, dto.email, dto.password, dto.role);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  async findAll(): Promise<AdminUserResponseDto[]> {
    return this.adminUsersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  async findById(@Param('id') id: string): Promise<AdminUserResponseDto> {
    const admin = await this.adminUsersService.findById(Number(id));
    if (!admin) {
      throw new NotFoundException('管理者アカウントが見つかりません');
    }
    return admin;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ): Promise<AdminUserResponseDto> {
    const admin = await this.adminUsersService.update(Number(id), dto);
    if (!admin) {
      throw new NotFoundException('管理者アカウントが見つかりません');
    }
    return admin;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  async delete(@Param('id') id: string): Promise<void> {
    const admin = await this.adminUsersService.findById(Number(id));
    if (!admin) {
      throw new NotFoundException('管理者アカウントが見つかりません');
    }
    await this.adminUsersService.softDelete(Number(id));
  }
}
