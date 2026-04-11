import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class AddImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
