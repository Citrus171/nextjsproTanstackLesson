import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import type { AdminRole } from "../entities/admin-user.entity";

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: "管理者太郎", description: "管理者の名前" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: "general",
    description: "ロール: super または general",
    enum: ["super", "general"],
  })
  @IsEnum(["super", "general"])
  @IsOptional()
  role?: AdminRole;
}
