import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderEntity } from '../orders/entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';

export type OrderWithRelations = OrderEntity & {
  user: UserEntity;
  items: OrderItemEntity[];
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOrderConfirmation(order: OrderWithRelations): Promise<void> {
    await this.mailerService.sendMail({
      to: order.user.email,
      subject: `【ご注文確認】注文番号 #${order.id}`,
      template: 'order-confirmation',
      context: {
        orderId: order.id,
        items: order.items.map((item) => ({
          ...item,
          subtotal: item.price * item.quantity,
        })),
        shippingFee: order.shippingFee,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
      },
    });
  }
}
