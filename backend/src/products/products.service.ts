import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductVariation, ProductImage } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddVariationDto } from './dto/add-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';
import { AddImageDto } from './dto/add-image.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Validate name
    if (!createProductDto.name || createProductDto.name.trim() === '') {
      throw new BadRequestException('name is required');
    }

    if (createProductDto.name.length > 100) {
      throw new BadRequestException('name must be 100 characters or less');
    }

    // Validate price
    if (typeof createProductDto.price !== 'number' || createProductDto.price < 100) {
      throw new BadRequestException('price must be 100 or more');
    }

    if (createProductDto.price > 999999999) {
      throw new BadRequestException('price must be 999999999 or less');
    }

    // Validate categoryId if provided
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${createProductDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description || null,
        price: createProductDto.price,
        categoryId: createProductDto.categoryId || null,
        isPublished: createProductDto.isPublished ?? false,
      },
    });
  }

  async findById(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variations: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        include: {
          images: true,
          variations: true,
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      total,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Validate name if provided
    if (updateProductDto.name !== undefined) {
      if (!updateProductDto.name || updateProductDto.name.trim() === '') {
        throw new BadRequestException('name is required');
      }
      if (updateProductDto.name.length > 100) {
        throw new BadRequestException('name must be 100 characters or less');
      }
    }

    // Validate price if provided
    if (updateProductDto.price !== undefined) {
      if (updateProductDto.price < 100) {
        throw new BadRequestException('price must be 100 or more');
      }
      if (updateProductDto.price > 999999999) {
        throw new BadRequestException('price must be 999999999 or less');
      }
    }

    // Validate categoryId if provided
    if (
      updateProductDto.categoryId !== undefined &&
      updateProductDto.categoryId !== null
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${updateProductDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        categoryId: updateProductDto.categoryId,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addVariation(
    productId: number,
    addVariationDto: AddVariationDto,
  ): Promise<ProductVariation> {
    // Validate product exists
    await this.findById(productId);

    // Validate size
    if (!addVariationDto.size || addVariationDto.size.trim() === '') {
      throw new BadRequestException('size is required');
    }

    if (addVariationDto.size.length > 50) {
      throw new BadRequestException('size must be 50 characters or less');
    }

    // Validate color
    if (!addVariationDto.color || addVariationDto.color.trim() === '') {
      throw new BadRequestException('color is required');
    }

    if (addVariationDto.color.length > 50) {
      throw new BadRequestException('color must be 50 characters or less');
    }

    // Validate price
    if (addVariationDto.price < 100) {
      throw new BadRequestException('price must be 100 or more');
    }

    if (addVariationDto.price > 999999999) {
      throw new BadRequestException('price must be 999999999 or less');
    }

    // Validate stock
    if (addVariationDto.stock < 0) {
      throw new BadRequestException('stock must be 0 or more');
    }

    return this.prisma.productVariation.create({
      data: {
        productId,
        size: addVariationDto.size,
        color: addVariationDto.color,
        price: addVariationDto.price,
        stock: addVariationDto.stock,
        imageUrl: addVariationDto.imageUrl || null,
      },
    });
  }

  async updateVariation(
    id: number,
    updateVariationDto: UpdateVariationDto,
  ): Promise<ProductVariation> {
    // Validate size if provided
    if (updateVariationDto.size !== undefined) {
      if (!updateVariationDto.size || updateVariationDto.size.trim() === '') {
        throw new BadRequestException('size is required');
      }
      if (updateVariationDto.size.length > 50) {
        throw new BadRequestException('size must be 50 characters or less');
      }
    }

    // Validate color if provided
    if (updateVariationDto.color !== undefined) {
      if (!updateVariationDto.color || updateVariationDto.color.trim() === '') {
        throw new BadRequestException('color is required');
      }
      if (updateVariationDto.color.length > 50) {
        throw new BadRequestException('color must be 50 characters or less');
      }
    }

    // Validate price if provided
    if (updateVariationDto.price !== undefined) {
      if (updateVariationDto.price < 100) {
        throw new BadRequestException('price must be 100 or more');
      }
      if (updateVariationDto.price > 999999999) {
        throw new BadRequestException('price must be 999999999 or less');
      }
    }

    // Validate stock if provided
    if (updateVariationDto.stock !== undefined) {
      if (updateVariationDto.stock < 0) {
        throw new BadRequestException('stock must be 0 or more');
      }
    }

    return this.prisma.productVariation.update({
      where: { id },
      data: {
        size: updateVariationDto.size,
        color: updateVariationDto.color,
        price: updateVariationDto.price,
        stock: updateVariationDto.stock,
        imageUrl: updateVariationDto.imageUrl,
      },
    });
  }

  async deleteVariation(id: number): Promise<void> {
    const variation = await this.prisma.productVariation.findUnique({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException(`Variation with id ${id} not found`);
    }

    await this.prisma.productVariation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async publish(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async addImage(
    productId: number,
    addImageDto: AddImageDto,
  ): Promise<ProductImage> {
    // Validate product exists
    await this.findById(productId);

    // Validate URL
    if (!addImageDto.url || addImageDto.url.trim() === '') {
      throw new BadRequestException('url is required');
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url: addImageDto.url,
        sortOrder: addImageDto.sortOrder || 0,
      },
    });
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    await this.prisma.productImage.delete({
      where: { id },
    });
  }

  async findByIdPublished(id: number): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, isPublished: true },
      include: {
        images: true,
        variations: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findAllPublished(options: {
    page?: number;
    limit?: number;
    categoryId?: number;
    keyword?: string;
    sort?: string;
  }): Promise<{ data: Product[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 10, 100));
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    // フィルター: カテゴリ
    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    // フィルター: キーワード
    if (options.keyword) {
      where.OR = [
        { name: { contains: options.keyword } },
        { description: { contains: options.keyword } },
      ];
    }

    // ソート
    const sortBy = options.sort || 'newest';
    let orderBy: any;
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: true,
          variations: true,
          category: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
    };
  }
}
