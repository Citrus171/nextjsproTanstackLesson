import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
// import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateTodoDto {
  @ApiProperty({ example: "NestJSを学ぶ", description: "Todoのタイトル" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: "Swaggerの設定から始める",
    description: "詳細説明",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: "優先度 1-3" })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  priority?: number;
}
