import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require("stripe");
import { OrderEntity, OrderStatus } from "../orders/entities/order.entity";
import { AdminOrderListDto } from "./dto/admin-order-list.dto";
import { AdminOrderDetailDto } from "./dto/admin-order-detail.dto";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: ["refunded"],
  refunded: [],
};

@Injectable()
export class AdminOrdersService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {
    this.stripe = new StripeLib(
      process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy",
      { apiVersion: "2026-03-25.dahlia" },
    );
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: OrderStatus,
  ): Promise<AdminOrderListDto> {
    const take = limit > 0 ? limit : 20;
    const skip = (page > 0 ? page - 1 : 0) * take;

    const [orders, total] = await this.orderRepository.findAndCount({
      skip,
      take,
      order: { createdAt: "DESC" },
      relations: { user: true },
      withDeleted: true,
      ...(status ? { where: { status } } : {}),
    });

    return {
      items: orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        user: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
        },
      })),
      page: page > 0 ? page : 1,
      limit: take,
      total,
    };
  }

  async findById(id: number): Promise<AdminOrderDetailDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, items: true },
      withDeleted: true,
    });
    if (!order) {
      throw new NotFoundException("注文が見つかりません");
    }

    return {
      id: order.id,
      status: order.status,
      shippingAddress: order.shippingAddress,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async updateStatus(id: number, newStatus: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException("注文が見つかりません");
    }

    if (!ALLOWED_TRANSITIONS[order.status].includes(newStatus)) {
      throw new BadRequestException(
        `${order.status} → ${newStatus} への遷移は許可されていません`,
      );
    }

    order.status = newStatus;
    await this.orderRepository.save(order);
  }

  async cancelOrder(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException("注文が見つかりません");
    }

    if (!ALLOWED_TRANSITIONS[order.status].includes("cancelled")) {
      throw new BadRequestException(
        `${order.status} の注文はキャンセルできません`,
      );
    }

    const previousStatus = order.status;

    // cancelled に更新
    order.status = "cancelled";
    await this.orderRepository.save(order);

    // paid/shipped のみ Stripe返金対象（pendingは未決済のため対象外）
    if (!["paid", "shipped"].includes(previousStatus) || !order.stripeSessionId) {
      return;
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );

      // payment_statusがpaidでない場合（未決済）は返金しない
      if (session.payment_status !== "paid" || !session.payment_intent) {
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent as { id: string }).id;

      await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch (error) {
      this.logger.error(
        `Stripe返金失敗: orderId=${order.id}, stripeSessionId=${order.stripeSessionId}`,
        (error as Error).stack ?? String(error),
      );
      throw new InternalServerErrorException("Stripe返金処理に失敗しました");
    }

    // refunded に更新
    order.status = "refunded";
    await this.orderRepository.save(order);
  }
}
