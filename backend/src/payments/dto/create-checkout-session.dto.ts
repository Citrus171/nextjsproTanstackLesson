import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: '123-4567' })
  @IsString()
  @IsNotEmpty()
  zip: string;

  @ApiProperty({ example: '東京都' })
  @IsString()
  @IsNotEmpty()
  prefecture: string;

  @ApiProperty({ example: '渋谷区' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '渋谷1-1-1' })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiProperty({ example: 'マンション101', required: false })
  @IsString()
  @IsOptional()
  address2?: string;
}
