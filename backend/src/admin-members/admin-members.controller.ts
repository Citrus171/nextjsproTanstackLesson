import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpCode,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminMembersService } from './admin-members.service';
import { AdminMemberListDto } from './dto/admin-member-list.dto';
import { AdminMemberDetailDto } from './dto/admin-member-detail.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@ApiTags('admin/members')
@ApiBearerAuth()
@Controller('admin/members')
@UseGuards(AdminJwtAuthGuard)
export class AdminMembersController {
  constructor(private readonly adminMembersService: AdminMembersService) {}

  @Get()
  @ApiOkResponse({ type: AdminMemberListDto })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<AdminMemberListDto> {
    return this.adminMembersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminMemberDetailDto })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<AdminMemberDetailDto> {
    return this.adminMembersService.findById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SuperAdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const deleted = await this.adminMembersService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('ユーザーが見つかりません');
    }
  }
}
