import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddVariationDto } from './dto/add-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';
import { AddImageDto } from './dto/add-image.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductVariationEntity } from './entities/product-variation.entity';
import { ProductImageEntity } from './entities/product-image.entity';

@ApiTags('Admin - Products')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('general', 'super')
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles('general', 'super')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: ProductEntity[]; total: number }> {
    return this.productsService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles('general', 'super')
  async findById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<ProductEntity> {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @Roles('general', 'super')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('general', 'super')
  async delete(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<void> {
    await this.productsService.delete(id);
  }

  @Post(':id/variations')
  @Roles('general', 'super')
  async addVariation(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
    @Body() addVariationDto: AddVariationDto,
  ): Promise<ProductVariationEntity> {
    return this.productsService.addVariation(id, addVariationDto);
  }

  @Put('variations/:variationId')
  @Roles('general', 'super')
  async updateVariation(
    @Param('variationId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    variationId: number,
    @Body() updateVariationDto: UpdateVariationDto,
  ): Promise<ProductVariationEntity> {
    return this.productsService.updateVariation(variationId, updateVariationDto);
  }

  @Delete('variations/:variationId')
  @Roles('general', 'super')
  async deleteVariation(
    @Param('variationId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    variationId: number,
  ): Promise<void> {
    await this.productsService.deleteVariation(variationId);
  }

  @Post(':id/publish')
  @Roles('general', 'super')
  async publish(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<ProductEntity> {
    return this.productsService.publish(id);
  }

  @Post(':id/unpublish')
  @Roles('general', 'super')
  async unpublish(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
  ): Promise<ProductEntity> {
    return this.productsService.unpublish(id);
  }

  @Post(':id/images')
  @Roles('general', 'super')
  async addImage(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    id: number,
    @Body() addImageDto: AddImageDto,
  ): Promise<ProductImageEntity> {
    return this.productsService.addImage(id, addImageDto);
  }

  @Delete('images/:imageId')
  @Roles('general', 'super')
  async deleteImage(
    @Param('imageId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    imageId: number,
  ): Promise<void> {
    await this.productsService.deleteImage(imageId);
  }
}
