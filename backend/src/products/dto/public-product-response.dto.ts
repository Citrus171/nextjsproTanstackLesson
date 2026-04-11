import { Exclude } from 'class-transformer';

export class ProductImageDto {
  id: number;
  url: string;
  sortOrder: number;
}

export class ProductVariationDto {
  id: number;
  size: string;
  color: string;
  price: number;
  stock: number;
}

export class CategoryDto {
  id: number;
  name: string;
}

export class PublicProductResponseDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  category: CategoryDto | null;
  images: ProductImageDto[];
  variations: ProductVariationDto[];

  @Exclude()
  isPublished: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;
}
