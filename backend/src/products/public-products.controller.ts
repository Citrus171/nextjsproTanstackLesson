import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';

@ApiTags('Public - Products')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category_id') categoryId?: number,
    @Query('keyword') keyword?: string,
    @Query('sort') sort?: string,
  ): Promise<{ data: ProductEntity[]; total: number }> {
    return this.productsService.findAllPublished({
      page,
      limit,
      categoryId,
      keyword,
      sort,
    });
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<ProductEntity> {
    return this.productsService.findByIdPublished(id);
  }
}
