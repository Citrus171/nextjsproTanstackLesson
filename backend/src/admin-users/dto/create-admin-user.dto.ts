import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { AdminRole } from '../entities/admin-user.entity';

export class CreateAdminUserDto {
  @ApiProperty({ example: '管理者太郎', description: '管理者の名前' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@example.com', description: 'メールアドレス' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '8文字以上のパスワード' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'general', description: 'ロール: super または general' })
  @IsEnum(['super', 'general'])
  role: AdminRole;
}
