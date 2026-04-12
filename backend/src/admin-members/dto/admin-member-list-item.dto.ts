import { ApiProperty } from "@nestjs/swagger";

export class AdminMemberListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  deletedAt: Date | null;
}
