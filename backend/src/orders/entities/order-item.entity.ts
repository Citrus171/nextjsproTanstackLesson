import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductVariationEntity } from '../../products/entities/product-variation.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @ManyToOne(() => OrderEntity, (o) => o.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ type: 'int' })
  variationId: number;

  @ManyToOne(() => ProductVariationEntity)
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariationEntity;

  @Column({ type: 'int' })
  productId: number;

  @Column()
  productName: string;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  price: number;
}
