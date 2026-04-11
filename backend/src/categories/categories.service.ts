import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    if (dto.parentId !== undefined && dto.parentId !== null) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('親カテゴリが見つかりません');
      }
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      parentId: dto.parentId,
    });

    return this.categoryRepository.save(category);
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    dto: UpdateCategoryDto | Partial<CreateCategoryDto>,
  ): Promise<CategoryEntity | null> {
    const category = await this.findById(id);
    if (!category) {
      return null;
    }

    if (dto.parentId !== undefined && dto.parentId !== null) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('親カテゴリが見つかりません');
      }
      category.parentId = dto.parentId;
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id],
    );

    if (result[0].count > 0) {
      throw new ConflictException('このカテゴリに紐付く商品があります');
    }

    await this.categoryRepository.delete({ id });
  }
}
