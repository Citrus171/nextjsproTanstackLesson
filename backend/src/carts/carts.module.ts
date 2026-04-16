import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
// import { CartEntity } from './entities/cart.entity';
// import { ProductVariationEntity } from '../products/entities/product-variation.entity';

@Module({
  imports: [],
  providers: [CartsService],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
