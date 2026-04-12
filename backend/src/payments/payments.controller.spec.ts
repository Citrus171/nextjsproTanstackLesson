import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: any;

  beforeEach(async () => {
    mockPaymentsService = {
      createCheckoutSession: jest.fn(),
      handleWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    const dto = {
      zip: '150-0001',
      prefecture: '東京都',
      city: '渋谷区',
      address1: '渋谷1-1-1',
    };

    it('checkout URLを返すこと', async () => {
      const mockUrl = 'https://checkout.stripe.com/cs_test_xxx';
      mockPaymentsService.createCheckoutSession.mockResolvedValue({ url: mockUrl });

      const req = { user: { id: 1 } };
      const result = await controller.createCheckoutSession(req as any, dto as any);

      expect(result).toEqual({ url: mockUrl });
      expect(mockPaymentsService.createCheckoutSession).toHaveBeenCalledWith(1, dto);
    });

    it('カートが空の場合はBadRequestExceptionが伝播すること', async () => {
      mockPaymentsService.createCheckoutSession.mockRejectedValue(
        new BadRequestException('カートが空です'),
      );

      const req = { user: { id: 1 } };
      await expect(
        controller.createCheckoutSession(req as any, dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('Stripe-Signatureヘッダーをサービスに渡すこと', async () => {
      mockPaymentsService.handleWebhook.mockResolvedValue(undefined);

      const rawBody = Buffer.from('test-body');
      const signature = 't=123,v1=abc';

      await controller.handleWebhook(rawBody, signature);

      expect(mockPaymentsService.handleWebhook).toHaveBeenCalledWith(
        signature,
        rawBody,
      );
    });

    it('署名検証失敗時はBadRequestExceptionが伝播すること', async () => {
      mockPaymentsService.handleWebhook.mockRejectedValue(
        new BadRequestException('Webhook署名の検証に失敗しました'),
      );

      const rawBody = Buffer.from('test-body');
      const signature = 'invalid-signature';

      await expect(
        controller.handleWebhook(rawBody, signature),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
