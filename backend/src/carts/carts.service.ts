import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, DataSource, LessThan } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductVariationEntity } from '../products/entities/product-variation.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductVariationEntity)
    private readonly variationRepository: Repository<ProductVariationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getCart(userId: number): Promise<CartEntity[]> {
    const sessionId = String(userId);
    return this.cartRepository.find({
      where: { sessionId, status: 'reserved' },
      relations: { variation: { product: true } },
    });
  }

  async addToCart(userId: number, dto: AddToCartDto): Promise<CartEntity | null> {
    const sessionId = String(userId);
    const { variationId, quantity = 1 } = dto;

    return this.dataSource.transaction(async (manager) => {
      // FOR UPDATE でロック取得
      const variation = await manager.findOne(ProductVariationEntity, {
        where: { id: variationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!variation) {
        throw new NotFoundException('バリエーションが見つかりません');
      }

      if (variation.stock < quantity) {
        throw new BadRequestException('在庫が不足しています');
      }

      // 同一セッション・同一バリエーションの既存カートを確認
      const existingCart = await manager.find(CartEntity, {
        where: { sessionId, variationId, status: 'reserved' },
      });

      if (existingCart.length > 0) {
        // 既存カートの数量を加算
        await manager.increment(
          CartEntity,
          { sessionId, variationId, status: 'reserved' },
          'quantity',
          quantity,
        );
      } else {
        // 新規カートを作成
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await manager.insert(CartEntity, {
          sessionId,
          variationId,
          quantity,
          status: 'reserved',
          reservedAt: new Date(),
          expiresAt,
        });
      }

      // 在庫を減算
      await manager.decrement(
        ProductVariationEntity,
        { id: variationId },
        'stock',
        quantity,
      );

      // 追加されたカートを返す
      return manager.findOne(CartEntity, {
        where: { sessionId, variationId, status: 'reserved' },
      });
    });
  }

  async updateItem(userId: number, cartId: number, dto: UpdateCartItemDto): Promise<void> {
    const sessionId = String(userId);
    const { quantity: newQuantity } = dto;

    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(CartEntity, {
        where: { id: cartId, status: 'reserved' },
      });

      if (!cart) {
        throw new NotFoundException('カートアイテムが見つかりません');
      }

      if (cart.sessionId !== sessionId) {
        throw new ForbiddenException('このカートアイテムを操作できません');
      }

      const oldQuantity = cart.quantity;
      const quantityDiff = newQuantity - oldQuantity;

      // variation を FOR UPDATE でロックし最新在庫を取得
      const variation = await manager.findOne(ProductVariationEntity, {
        where: { id: cart.variationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!variation) {
        throw new NotFoundException('商品バリエーションが見つかりません');
      }

      if (quantityDiff > 0 && variation.stock < quantityDiff) {
        throw new BadRequestException('在庫が不足しています');
      }

      // 在庫を調整
      if (quantityDiff > 0) {
        await manager.decrement(
          ProductVariationEntity,
          { id: cart.variationId },
          'stock',
          quantityDiff,
        );
      } else if (quantityDiff < 0) {
        await manager.increment(
          ProductVariationEntity,
          { id: cart.variationId },
          'stock',
          Math.abs(quantityDiff),
        );
      }

      // カートの数量を更新
      await manager.update(CartEntity, cartId, { quantity: newQuantity });
    });
  }

  async removeItem(userId: number, cartId: number): Promise<void> {
    const sessionId = String(userId);

    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(CartEntity, {
        where: { id: cartId, status: 'reserved' },
      });

      if (!cart) {
        throw new NotFoundException('カートアイテムが見つかりません');
      }

      if (cart.sessionId !== sessionId) {
        throw new ForbiddenException('このカートアイテムを操作できません');
      }

      // 在庫を返却
      await manager.increment(
        ProductVariationEntity,
        { id: cart.variationId },
        'stock',
        cart.quantity,
      );

      // カートアイテムを削除
      await manager.delete(CartEntity, cartId);
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async releaseExpiredCarts(): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const expiredCarts = await manager.find(CartEntity, {
        where: {
          status: 'reserved',
          expiresAt: LessThan(now),
        },
        lock: { mode: 'pessimistic_write' },
      });

      for (const cart of expiredCarts) {
        // 在庫を返却
        await manager.increment(
          ProductVariationEntity,
          { id: cart.variationId },
          'stock',
          cart.quantity,
        );

        // ステータスを expired に更新
        await manager.update(CartEntity, { id: cart.id }, { status: 'expired' });
      }
    });
  }
}
