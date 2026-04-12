import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductEntity } from './product.entity';

@Entity('product_variations')
export class ProductVariationEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'int' })
  productId: number;

  @ApiPropertyOptional({ type: () => ProductEntity })
  @ManyToOne(() => ProductEntity, (p) => p.variations)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ApiProperty()
  @Column()
  size: string;

  @ApiProperty()
  @Column()
  color: string;

  @ApiProperty()
  @Column({ type: 'int' })
  price: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Column({ nullable: true, type: 'varchar' })
  imageUrl: string | null;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
