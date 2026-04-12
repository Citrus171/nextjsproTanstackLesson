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

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;
}
