import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ["shipped", "delivered"] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["shipped", "delivered"])
  status: "shipped" | "delivered";
}
