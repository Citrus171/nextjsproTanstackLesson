import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ["shipped", "delivered"] })
  @IsIn(["shipped", "delivered"])
  status: "shipped" | "delivered";
}
