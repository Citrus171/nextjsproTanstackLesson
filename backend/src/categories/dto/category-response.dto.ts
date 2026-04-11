import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '衣類' })
  name: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ type: [CategoryResponseDto], description: '子カテゴリ一覧' })
  children: CategoryResponseDto[];

  @ApiProperty({
    example: '2026-04-11T12:00:00Z',
    description: '作成日時',
  })
  createdAt: Date;
}
