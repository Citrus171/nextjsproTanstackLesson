import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId !== undefined && dto.parentId !== null) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('親カテゴリが見つかりません');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId,
      },
    });

    return this.prisma.category.findUnique({
      where: { id: category.id },
      include: {
        parent: true,
        children: true,
      },
    }) as Promise<Category>;
  }

  async findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    dto: UpdateCategoryDto | Partial<CreateCategoryDto>,
  ): Promise<Category | null> {
    if (dto.parentId !== undefined && dto.parentId !== null) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('親カテゴリが見つかりません');
      }
    }

    try {
      await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name,
          parentId: dto.parentId,
        },
      });

      return this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
        },
      });
    } catch {
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new ConflictException('このカテゴリに紐付く商品があります');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
