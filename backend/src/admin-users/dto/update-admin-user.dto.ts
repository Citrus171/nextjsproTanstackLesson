import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminRole } from '../entities/admin-user.entity';

export class UpdateAdminUserDto {
  @ApiProperty({ example: '管理者太郎', description: '管理者の名前' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'general', description: 'ロール: super または general' })
  @IsEnum(['super', 'general'])
  @IsOptional()
  role?: AdminRole;
}
