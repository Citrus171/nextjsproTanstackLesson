import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductVariationEntity } from '../../products/entities/product-variation.entity';

@Entity('carts')
export class CartEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  sessionId: string;

  @ApiProperty()
  @Column({ type: 'int' })
  variationId: number;

  @ApiProperty({ type: () => ProductVariationEntity })
  @ManyToOne(() => ProductVariationEntity)
  @JoinColumn({ name: 'variationId' })
  variation: ProductVariationEntity;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty()
  @Column({ type: 'datetime' })
  reservedAt: Date;

  @ApiProperty()
  @Column({ type: 'datetime' })
  expiresAt: Date;

  @ApiProperty({ enum: ['reserved', 'purchased', 'expired'] })
  @Column({
    type: 'enum',
    enum: ['reserved', 'purchased', 'expired'],
    default: 'reserved',
  })
  status: 'reserved' | 'purchased' | 'expired';
}
