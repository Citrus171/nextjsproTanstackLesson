import { ApiProperty } from '@nestjs/swagger';

export class AdminUserResponseDto {
  @ApiProperty({ example: 1, description: 'ID' })
  id: number;

  @ApiProperty({ example: '管理者太郎', description: '管理者の名前' })
  name: string;

  @ApiProperty({ example: 'admin@example.com', description: 'メールアドレス' })
  email: string;

  @ApiProperty({ example: 'general', description: 'ロール: super または general' })
  role: 'super' | 'general';

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: '作成日時' })
  createdAt: Date;
}
