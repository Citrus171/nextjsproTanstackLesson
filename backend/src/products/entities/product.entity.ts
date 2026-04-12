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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { ProductImageEntity } from './product-image.entity';
import { ProductVariationEntity } from './product-variation.entity';

@Entity('products')
export class ProductEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @ApiProperty()
  @Column({ type: 'int' })
  price: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Column({ nullable: true, type: 'int' })
  categoryId: number | null;

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity | null;

  @ApiProperty()
  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => ProductImageEntity, (img) => img.product)
  images: ProductImageEntity[];

  @OneToMany(() => ProductVariationEntity, (v) => v.product)
  variations: ProductVariationEntity[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
