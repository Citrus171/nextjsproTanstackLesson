import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_variations')
export class ProductVariationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => ProductEntity, (p) => p.variations)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true, type: 'varchar' })
  imageUrl: string | null;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
