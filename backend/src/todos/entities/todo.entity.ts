import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TodoEntity {
  @ApiProperty({ example: 1, description: 'ID' })
  id: number;

  @ApiProperty({ example: 'NestJSを学ぶ', description: 'タイトル' })
  title: string;

  @ApiPropertyOptional({ example: 'Swaggerの設定から始める', description: '詳細説明' })
  description?: string;

  @ApiProperty({ example: false, description: '完了フラグ' })
  completed: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: '作成日時' })
  createdAt: string;
}
