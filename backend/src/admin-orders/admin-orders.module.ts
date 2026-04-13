import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { OrderEntity } from "../orders/entities/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  providers: [AdminOrdersService],
  controllers: [AdminOrdersController],
})
export class AdminOrdersModule {}
