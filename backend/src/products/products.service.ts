import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductVariationEntity } from './entities/product-variation.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddVariationDto } from './dto/add-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';
import { AddImageDto } from './dto/add-image.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductVariationEntity)
    private variationRepository: Repository<ProductVariationEntity>,
    @InjectRepository(ProductImageEntity)
    private imageRepository: Repository<ProductImageEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
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
      const category = await this.categoryRepository.findOneBy({
        id: createProductDto.categoryId,
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${createProductDto.categoryId} not found`,
        );
      }
    }

    const product = this.productRepository.create({
      name: createProductDto.name,
      description: createProductDto.description || null,
      price: createProductDto.price,
      categoryId: createProductDto.categoryId || null,
      isPublished: false,
    });

    return this.productRepository.save(product);
  }

  async findById(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'variations', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
  }): Promise<{ data: ProductEntity[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository.find({
        relations: ['images', 'variations', 'category'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.productRepository.count(),
    ]);

    return {
      data: products,
      total,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.findById(id);

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
      const category = await this.categoryRepository.findOneBy({
        id: updateProductDto.categoryId,
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${updateProductDto.categoryId} not found`,
        );
      }
    }

    // Update product fields
    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description || null;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }
    if (updateProductDto.categoryId !== undefined) {
      product.categoryId = updateProductDto.categoryId;
    }

    return this.productRepository.save(product);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.productRepository.softDelete(id);
  }

  async addVariation(
    productId: number,
    addVariationDto: AddVariationDto,
  ): Promise<ProductVariationEntity> {
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

    const variation = this.variationRepository.create({
      productId,
      size: addVariationDto.size,
      color: addVariationDto.color,
      price: addVariationDto.price,
      stock: addVariationDto.stock,
      imageUrl: addVariationDto.imageUrl || null,
    });

    return this.variationRepository.save(variation);
  }

  async updateVariation(
    id: number,
    updateVariationDto: UpdateVariationDto,
  ): Promise<ProductVariationEntity> {
    const variation = await this.variationRepository.findOne({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException(`Variation with id ${id} not found`);
    }

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

    // Update variation fields
    if (updateVariationDto.size !== undefined) {
      variation.size = updateVariationDto.size;
    }
    if (updateVariationDto.color !== undefined) {
      variation.color = updateVariationDto.color;
    }
    if (updateVariationDto.price !== undefined) {
      variation.price = updateVariationDto.price;
    }
    if (updateVariationDto.stock !== undefined) {
      variation.stock = updateVariationDto.stock;
    }
    if (updateVariationDto.imageUrl !== undefined) {
      variation.imageUrl = updateVariationDto.imageUrl || null;
    }

    return this.variationRepository.save(variation);
  }

  async deleteVariation(id: number): Promise<void> {
    const variation = await this.variationRepository.findOne({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException(`Variation with id ${id} not found`);
    }

    await this.variationRepository.softDelete(id);
  }

  async publish(id: number): Promise<ProductEntity> {
    const product = await this.findById(id);
    product.isPublished = true;
    return this.productRepository.save(product);
  }

  async unpublish(id: number): Promise<ProductEntity> {
    const product = await this.findById(id);
    product.isPublished = false;
    return this.productRepository.save(product);
  }

  async addImage(
    productId: number,
    addImageDto: AddImageDto,
  ): Promise<ProductImageEntity> {
    // Validate product exists
    await this.findById(productId);

    // Validate URL
    if (!addImageDto.url || addImageDto.url.trim() === '') {
      throw new BadRequestException('url is required');
    }

    const image = this.imageRepository.create({
      productId,
      url: addImageDto.url,
      sortOrder: addImageDto.sortOrder || 0,
    });

    return this.imageRepository.save(image);
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    await this.imageRepository.delete(id);
  }
}
