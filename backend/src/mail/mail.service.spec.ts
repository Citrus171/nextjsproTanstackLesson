import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';

describe('MailService', () => {
  let service: MailService;
  let mockMailerService: { sendMail: jest.Mock };

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    name: 'テストユーザー',
  };

  const mockItems = [
    {
      id: 1,
      productName: 'テストシャツ',
      size: 'M',
      color: 'red',
      quantity: 2,
      price: 1500,
    },
  ] as OrderItemEntity[];

  const mockOrder = {
    id: 42,
    shippingAddress: {
      zip: '150-0001',
      prefecture: '東京都',
      city: '渋谷区',
      address1: '渋谷1-1-1',
    },
    shippingFee: 800,
    totalAmount: 3800,
    user: mockUser as UserEntity,
    items: mockItems,
  } as OrderEntity & { user: UserEntity; items: OrderItemEntity[] };

  beforeEach(async () => {
    mockMailerService = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  describe('sendOrderConfirmation', () => {
    it('注文したユーザーのメールアドレスに送信されること', async () => {
      await service.sendOrderConfirmation(mockOrder);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'test@example.com' }),
      );
    });

    it('件名に注文番号が含まれること', async () => {
      await service.sendOrderConfirmation(mockOrder);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: '【ご注文確認】注文番号 #42' }),
      );
    });

    it('order-confirmation テンプレートが使用されること', async () => {
      await service.sendOrderConfirmation(mockOrder);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'order-confirmation' }),
      );
    });

    it('テンプレートに注文番号・商品一覧（subtotal付き）・配送料・合計・配送先が渡されること', async () => {
      await service.sendOrderConfirmation(mockOrder);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            orderId: 42,
            items: [expect.objectContaining({ ...mockItems[0], subtotal: 3000 })],
            shippingFee: 800,
            totalAmount: 3800,
            shippingAddress: mockOrder.shippingAddress,
          }),
        }),
      );
    });
  });
});
