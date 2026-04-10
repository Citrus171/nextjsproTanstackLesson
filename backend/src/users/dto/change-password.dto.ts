import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '現在のパスワード' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: '新しいパスワード（8文字以上）' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
