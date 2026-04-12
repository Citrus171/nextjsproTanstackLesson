import { ApiProperty } from "@nestjs/swagger";
import { AdminMemberListItemDto } from "./admin-member-list-item.dto";

export class AdminMemberListDto {
  @ApiProperty({ type: [AdminMemberListItemDto] })
  items: AdminMemberListItemDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}
