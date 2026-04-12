import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CartEntity } from '../carts/entities/cart.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { StoreSettingsEntity } from '../store-settings/entities/store-settings.entity';
import { StripeEventEntity } from './entities/stripe-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      OrderEntity,
      OrderItemEntity,
      StoreSettingsEntity,
      StripeEventEntity,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
