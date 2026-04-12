import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { StoreSettingsService } from './store-settings.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

@ApiTags('admin/store-settings')
@Controller('admin/store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '店舗設定を取得' })
  async getSettings(): Promise<StoreSettingsResponseDto> {
    return this.storeSettingsService.getSettings();
  }

  @Put()
  @HttpCode(200)
  @UseGuards(AdminJwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '店舗設定を更新（super管理者のみ）' })
  async updateSettings(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettingsResponseDto> {
    return this.storeSettingsService.updateSettings(dto);
  }
}
