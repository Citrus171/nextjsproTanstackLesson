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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartEntity } from './entities/cart.entity';

@ApiTags('cart')
@Controller('cart')
@UseGuards(UserJwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'カート取得' })
  @ApiOkResponse({ type: [CartEntity] })
  async getCart(@CurrentUser() user: { id: number }): Promise<CartEntity[]> {
    return this.cartsService.getCart(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'カート追加' })
  @ApiOkResponse({ type: CartEntity })
  async addToCart(@CurrentUser() user: { id: number }, @Body() dto: AddToCartDto): Promise<CartEntity | null> {
    return this.cartsService.addToCart(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'カートアイテム数量変更' })
  async updateItem(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ): Promise<void> {
    return this.cartsService.updateItem(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'カートアイテム削除' })
  async removeItem(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.cartsService.removeItem(user.id, id);
  }
}
