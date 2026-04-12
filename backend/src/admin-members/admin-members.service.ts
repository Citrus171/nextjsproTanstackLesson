import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { AdminMemberDetailDto } from './dto/admin-member-detail.dto';
import { AdminMemberListDto } from './dto/admin-member-list.dto';
import { AdminMemberListItemDto } from './dto/admin-member-list-item.dto';
import { OrderSummaryDto } from './dto/order-summary.dto';

@Injectable()
export class AdminMembersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async findAll(page = 1, limit = 20): Promise<AdminMemberListDto> {
    const take = limit > 0 ? limit : 20;
    const skip = (page > 0 ? page - 1 : 0) * take;
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    const items = users.map((user) => this.toListItemDto(user));
    return {
      items,
      page: page > 0 ? page : 1,
      limit: take,
      total,
    };
  }

  async findById(id: number): Promise<AdminMemberDetailDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    const orders = await this.findOrdersByUserId(id);
    return this.toDetailDto(user, orders);
  }

  async findOrdersByUserId(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async softDelete(id: number): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return false;
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);
    return true;
  }

  private toListItemDto(user: UserEntity): AdminMemberListItemDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt ?? null,
    };
  }

  private toDetailDto(user: UserEntity, orders: OrderEntity[]): AdminMemberDetailDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt ?? null,
      orders: orders.map((order) => this.toOrderSummaryDto(order)),
    };
  }

  private toOrderSummaryDto(order: OrderEntity): OrderSummaryDto {
    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    };
  }
}
