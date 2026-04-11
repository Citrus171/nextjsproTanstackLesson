import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ProductsService } from './products.service';
import { PublicProductResponseDto } from './dto/public-product-response.dto';

@ApiTags('Public - Products')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST, optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST, optional: true })) limit?: number,
    @Query('category_id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST, optional: true })) categoryId?: number,
    @Query('keyword') keyword?: string,
    @Query('sort') sort?: string,
  ): Promise<{ data: PublicProductResponseDto[]; total: number }> {
    const result = await this.productsService.findAllPublished({
      page,
      limit,
      categoryId,
      keyword,
      sort,
    });

    return {
      data: plainToInstance(PublicProductResponseDto, result.data),
      total: result.total,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<PublicProductResponseDto> {
    const product = await this.productsService.findByIdPublished(id);
    return plainToInstance(PublicProductResponseDto, product);
  }
}
