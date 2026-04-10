import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { ProductImageEntity } from './product-image.entity';
import { ProductVariationEntity } from './product-variation.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ type: 'int' })
  price: number;

  @Column({ nullable: true, type: 'int' })
  categoryId: number | null;

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity | null;

  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => ProductImageEntity, (img) => img.product)
  images: ProductImageEntity[];

  @OneToMany(() => ProductVariationEntity, (v) => v.product)
  variations: ProductVariationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
