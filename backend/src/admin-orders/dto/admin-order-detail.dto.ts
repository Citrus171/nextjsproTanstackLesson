import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../../orders/entities/order.entity";
import { AdminOrderUserDto } from "./admin-order-list.dto";

export class ShippingAddressDto {
  @ApiProperty()
  zip: string;

  @ApiProperty()
  prefecture: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  address1: string;

  @ApiProperty({ required: false, nullable: true })
  address2?: string;
}

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

  @ApiProperty({ type: ShippingAddressDto })
  shippingAddress: ShippingAddressDto;

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
