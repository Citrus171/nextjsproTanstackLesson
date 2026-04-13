import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus, ShippingAddress } from "../../orders/entities/order.entity";
import { AdminOrderUserDto } from "./admin-order-list.dto";

export class AdminOrderItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  size: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export class AdminOrderDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
  })
  status: OrderStatus;

  @ApiProperty()
  shippingAddress: ShippingAddress;

  @ApiProperty()
  shippingFee: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: AdminOrderUserDto })
  user: AdminOrderUserDto;

  @ApiProperty({ type: [AdminOrderItemDto] })
  items: AdminOrderItemDto[];
}
