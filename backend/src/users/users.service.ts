import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async create(name: string, email: string, password: string): Promise<UserEntity> {
    const exists = await this.userRepository.findOneBy({ email });
    if (exists) throw new ConflictException('このメールアドレスは既に登録されています');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, email, password: hashed });
    return this.userRepository.save(user);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('ユーザーが見つかりません');
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('現在のパスワードが正しくありません');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashed });
  }

  async updateProfile(userId: number, name: string, address: string | null): Promise<UserEntity> {
    await this.userRepository.update(userId, { name, address });
    return this.findById(userId);
  }

  async findOrdersByUserId(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      select: { id: true, status: true, totalAmount: true, createdAt: true },
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async withdraw(userId: number): Promise<void> {
    await this.userRepository.softDelete(userId);
  }
}
