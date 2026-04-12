import { ApiProperty } from "@nestjs/swagger";
import { OrderSummaryDto } from "./order-summary.dto";

export class AdminMemberDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, nullable: true })
  address: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: [OrderSummaryDto] })
  orders: OrderSummaryDto[];
}
