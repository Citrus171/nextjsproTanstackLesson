import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, email: string, password: string): Promise<User> {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('このメールアドレスは既に登録されています');

    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashed },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('ユーザーが見つかりません');
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('現在のパスワードが正しくありません');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }

  async updateProfile(userId: number, name: string, address?: string | null): Promise<User> {
    const updateData: Partial<User> = { name };
    if (address !== undefined) {
      updateData.address = address;
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return this.findById(userId);
  }

  async findOrdersByUserId(userId: number) {
    return this.prisma.order.findMany({
      select: { id: true, status: true, totalAmount: true, createdAt: true },
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async withdraw(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
