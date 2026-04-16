import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { UserEntity } from "../users/entities/user.entity";
// import { OrderEntity } from "../orders/entities/order.entity";
// import { AdminMemberDetailDto } from "./dto/admin-member-detail.dto";
// import { AdminMemberListDto } from "./dto/admin-member-list.dto";
// import { AdminMemberListItemDto } from "./dto/admin-member-list-item.dto";
// import { OrderSummaryDto } from "./dto/order-summary.dto";

@Injectable()
export class AdminMembersService {
  constructor(
    // @InjectRepository(UserEntity)
    // private readonly userRepository: Repository<UserEntity>,
    // @InjectRepository(OrderEntity)
    // private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async findAll(_page = 1, _limit = 20): Promise<AdminMemberListDto> {
    throw new Error("Disabled during migration");
  }

  async findById(_id: number): Promise<AdminMemberDetailDto> {
    throw new Error("Disabled during migration");
  }

  async findOrdersByUserId(_userId: number): Promise<any[]> {
    throw new Error("Disabled during migration");
  }

  async softDelete(_id: number): Promise<boolean> {
    throw new Error("Disabled during migration");
  }

  // private toListItemDto(user: UserEntity): AdminMemberListItemDto {
  //   return {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     createdAt: user.createdAt,
  //     deletedAt: user.deletedAt ?? null,
  //   };
  // }

  // private toDetailDto(
  //   user: UserEntity,
  //   orders: OrderEntity[],
  // ): AdminMemberDetailDto {
  //   return {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     address: user.address,
  //     createdAt: user.createdAt,
  //     deletedAt: user.deletedAt ?? null,
  //     orders: orders.map((order) => this.toOrderSummaryDto(order)),
  //   };
  // }

  // private toOrderSummaryDto(order: OrderEntity): OrderSummaryDto {
  //   return {
  //     id: order.id,
  //     status: order.status,
  //     totalAmount: order.totalAmount,
  //     createdAt: order.createdAt,
  //   };
  // }
}
