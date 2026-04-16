import { Injectable, BadRequestException, Logger } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository, DataSource, QueryFailedError } from "typeorm";
import Stripe from "stripe";
// import { CartEntity } from "../carts/entities/cart.entity";
// import { OrderEntity } from "../orders/entities/order.entity";
// import { OrderItemEntity } from "../orders/entities/order-item.entity";
// import { StoreSettingsEntity } from "../store-settings/entities/store-settings.entity";
// import { StripeEventEntity } from "./entities/stripe-event.entity";
// import { ProductVariationEntity } from "../products/entities/product-variation.entity";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { MailService } from "../mail/mail.service";

// type CartItemWithRelations = CartEntity & {
//   variation: ProductVariationEntity & {
//     product: {
//       id: number;
//       name: string;
//     };
//   };
// };

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy",
  );
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    // @InjectRepository(CartEntity)
    // private readonly cartRepository: Repository<CartEntity>,
    // @InjectRepository(OrderEntity)
    // private readonly orderRepository: Repository<OrderEntity>,
    // @InjectRepository(OrderItemEntity)
    // private readonly orderItemRepository: Repository<OrderItemEntity>,
    // @InjectRepository(StoreSettingsEntity)
    // private readonly storeSettingsRepository: Repository<StoreSettingsEntity>,
    // @InjectRepository(StripeEventEntity)
    // private readonly stripeEventRepository: Repository<StripeEventEntity>,
    // private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async createCheckoutSession(
    _userId: number,
    _dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    // Temporarily disabled due to TypeORM removal
    throw new BadRequestException("Checkout session creation disabled during migration");
  }

  async handleWebhook(_signature: string, _rawBody: Buffer): Promise<void> {
    // Temporarily disabled due to TypeORM removal
    throw new BadRequestException("Webhook processing disabled during migration");
  }
}
