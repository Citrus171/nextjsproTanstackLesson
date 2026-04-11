import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll();
    return categories.map((cat) => this.toResponse(cat));
  }

  private toResponse(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      children: (category.children || []).map((child: CategoryEntity) =>
        this.toResponse(child),
      ),
      createdAt: category.createdAt,
    };
  }
}
