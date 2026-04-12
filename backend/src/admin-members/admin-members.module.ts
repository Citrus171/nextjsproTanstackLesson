import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminMembersService } from "./admin-members.service";
import { AdminMembersController } from "./admin-members.controller";
import { UserEntity } from "../users/entities/user.entity";
import { OrderEntity } from "../orders/entities/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OrderEntity])],
  providers: [AdminMembersService],
  controllers: [AdminMembersController],
})
export class AdminMembersModule {}
