import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_images')
export class ProductImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => ProductEntity, (p) => p.images)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  url: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
