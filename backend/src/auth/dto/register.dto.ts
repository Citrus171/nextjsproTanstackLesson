import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "山田太郎", description: "名前" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "user@example.com", description: "メールアドレス" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", description: "8文字以上のパスワード" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
