import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartEntity } from './entities/cart.entity';

@ApiTags('cart')
@Controller('cart')
@UseGuards(UserJwtAuthGuard)
@ApiBearerAuth('JWT')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'カート取得' })
  async getCart(@Request() req: any): Promise<CartEntity[]> {
    return this.cartsService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'カート追加' })
  async addToCart(@Request() req: any, @Body() dto: AddToCartDto): Promise<CartEntity | null> {
    return this.cartsService.addToCart(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'カートアイテム数量変更' })
  async updateItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ): Promise<void> {
    return this.cartsService.updateItem(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'カートアイテム削除' })
  async removeItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.cartsService.removeItem(req.user.id, id);
  }
}
