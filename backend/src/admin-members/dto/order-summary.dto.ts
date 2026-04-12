import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../../orders/entities/order.entity";

export class OrderSummaryDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
  })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  createdAt: Date;
}
