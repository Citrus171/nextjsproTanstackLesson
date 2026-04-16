import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { CartStatus } from "@prisma/client";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number) {
    const sessionId = String(userId);
    return this.prisma.cart.findMany({
      where: { sessionId, status: CartStatus.reserved },
      include: { variation: { include: { product: true } } },
    });
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const sessionId = String(userId);
    const { variationId, quantity = 1 } = dto;

    return this.prisma.$transaction(async (tx) => {
      // バリエーションを取得
      const variation = await tx.productVariation.findUnique({
        where: { id: variationId },
      });

      if (!variation) {
        throw new NotFoundException("バリエーションが見つかりません");
      }

      // 同一セッション・同一バリエーションの既存カートを確認
      const existingCart = await tx.cart.findFirst({
        where: { sessionId, variationId, status: CartStatus.reserved },
      });

      if (existingCart) {
        // 既存カートの数量を加算
        await tx.cart.update({
          where: { id: existingCart.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        // 新規カートを作成
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await tx.cart.create({
          data: {
            sessionId,
            variationId,
            quantity,
            status: CartStatus.reserved,
            reservedAt: new Date(),
            expiresAt,
          },
        });
      }

      // 在庫を原子的に減算（競合防止）
      const stockUpdateResult = await tx.productVariation.updateMany({
        where: { id: variationId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });

      if (stockUpdateResult.count === 0) {
        throw new BadRequestException("在庫が不足しています");
      }

      // 追加されたカートを返す
      return tx.cart.findFirst({
        where: { sessionId, variationId, status: CartStatus.reserved },
      });
    });
  }

  async updateItem(
    userId: number,
    cartId: number,
    dto: UpdateCartItemDto,
  ): Promise<void> {
    const sessionId = String(userId);
    const { quantity: newQuantity } = dto;

    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { id: cartId, status: CartStatus.reserved },
      });

      if (!cart) {
        throw new NotFoundException("カートアイテムが見つかりません");
      }

      if (cart.sessionId !== sessionId) {
        throw new ForbiddenException("このカートアイテムを操作できません");
      }

      const oldQuantity = cart.quantity;
      const quantityDiff = newQuantity - oldQuantity;

      // バリエーションを取得
      const variation = await tx.productVariation.findUnique({
        where: { id: cart.variationId },
      });

      if (!variation) {
        throw new NotFoundException("商品バリエーションが見つかりません");
      }

      if (quantityDiff > 0 && variation.stock < quantityDiff) {
        throw new BadRequestException("在庫が不足しています");
      }

      // 在庫を調整
      if (quantityDiff > 0) {
        await tx.productVariation.update({
          where: { id: cart.variationId },
          data: { stock: { decrement: quantityDiff } },
        });
      } else if (quantityDiff < 0) {
        await tx.productVariation.update({
          where: { id: cart.variationId },
          data: { stock: { increment: Math.abs(quantityDiff) } },
        });
      }

      // カートの数量を更新
      await tx.cart.update({
        where: { id: cartId },
        data: { quantity: newQuantity },
      });
    });
  }

  async removeItem(userId: number, cartId: number): Promise<void> {
    const sessionId = String(userId);

    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { id: cartId, status: CartStatus.reserved },
      });

      if (!cart) {
        throw new NotFoundException("カートアイテムが見つかりません");
      }

      if (cart.sessionId !== sessionId) {
        throw new ForbiddenException("このカートアイテムを操作できません");
      }

      // 在庫を返却
      await tx.productVariation.update({
        where: { id: cart.variationId },
        data: { stock: { increment: cart.quantity } },
      });

      // カートアイテムを削除
      await tx.cart.delete({
        where: { id: cartId },
      });
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async releaseExpiredCarts(): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const expiredCarts = await tx.cart.findMany({
        where: {
          status: CartStatus.reserved,
          expiresAt: { lt: now },
        },
      });

      for (const cart of expiredCarts) {
        // 在庫を返却
        await tx.productVariation.update({
          where: { id: cart.variationId },
          data: { stock: { increment: cart.quantity } },
        });

        // ステータスを expired に更新
        await tx.cart.update({
          where: { id: cart.id },
          data: { status: CartStatus.expired },
        });
      }
    });
  }
}
