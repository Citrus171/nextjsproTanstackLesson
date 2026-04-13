import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../../orders/entities/order.entity";

export class AdminOrderUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class AdminOrderListItemDto {
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

  @ApiProperty({ type: AdminOrderUserDto })
  user: AdminOrderUserDto;
}

export class AdminOrderListDto {
  @ApiProperty({ type: [AdminOrderListItemDto] })
  items: AdminOrderListItemDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}
