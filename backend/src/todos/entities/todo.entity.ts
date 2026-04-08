import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('todos')
export class TodoEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID' })
  id: number;

  @Column()
  @ApiProperty({ example: 'NestJSを学ぶ', description: 'タイトル' })
  title: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ example: 'Swaggerの設定から始める', description: '詳細説明' })
  description?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ example: 1, description: '優先度 1-3' })
  priority?: number;

  @Column({ default: false })
  @ApiProperty({ example: false, description: '完了フラグ' })
  completed: boolean;

  @CreateDateColumn()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: '作成日時' })
  createdAt: Date;
}
