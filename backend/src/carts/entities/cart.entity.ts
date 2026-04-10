import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariationEntity } from '../../products/entities/product-variation.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({ type: 'int' })
  variationId: number;

  @ManyToOne(() => ProductVariationEntity)
  @JoinColumn({ name: 'variationId' })
  variation: ProductVariationEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'datetime' })
  reservedAt: Date;

  @Column({ type: 'datetime' })
  expiresAt: Date;
}
