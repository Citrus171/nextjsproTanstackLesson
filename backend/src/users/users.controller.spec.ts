import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderEntity } from '../orders/entities/order.entity';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  Object.assign(new UserEntity(), {
    id: 1,
    name: '山田太郎',
    email: 'test@example.com',
    password: 'hashed',
    address: null,
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    ...overrides,
  });

const mockUsersService = {
  findById: jest.fn(),
  changePassword: jest.fn(),
  updateProfile: jest.fn(),
  findOrdersByUserId: jest.fn(),
  withdraw: jest.fn(),
};

const makeOrder = (overrides: Partial<OrderEntity> = {}): OrderEntity =>
  Object.assign(new OrderEntity(), {
    id: 1,
    userId: 1,
    status: 'paid' as const,
    totalAmount: 5000,
    createdAt: new Date('2024-06-01'),
    ...overrides,
  });

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  // ── GET /users/me ──────────────────────────────────────────
  describe('getMe', () => {
    it('認証済みユーザーのプロフィールを返すこと（passwordを除く）', async () => {
      const user = makeUser();
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.getMe({ id: 1 });

      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 1, name: '山田太郎', email: 'test@example.com' });
    });

    it('ユーザーが存在しない時、NotFoundExceptionが伝播すること', async () => {
      mockUsersService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.getMe({ id: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  // ── PUT /users/me/password ─────────────────────────────────
  describe('changePassword', () => {
    it('正しい現在のパスワードの時、204を返すこと', async () => {
      mockUsersService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        { id: 1 },
        { currentPassword: 'current123', newPassword: 'newPass123' },
      );

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(1, 'current123', 'newPass123');
      expect(result).toBeUndefined();
    });

    it('現在のパスワードが不一致の時、UnauthorizedExceptionが伝播すること', async () => {
      mockUsersService.changePassword.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.changePassword({ id: 1 }, { currentPassword: 'wrong', newPassword: 'newPass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── PUT /users/me ──────────────────────────────────────────
  describe('updateProfile', () => {
    it('更新済みプロフィールを返すこと（passwordを除く）', async () => {
      const currentUser = makeUser();
      const updatedUser = makeUser({ name: '新しい名前', address: '東京都渋谷区' });
      mockUsersService.findById.mockResolvedValue(currentUser);
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        { id: 1 },
        { name: '新しい名前', address: '東京都渋谷区' },
      );

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(1, '新しい名前', '東京都渋谷区');
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ name: '新しい名前', address: '東京都渋谷区' });
    });

    it('address が undefined の時は現在の住所を維持すること', async () => {
      const currentUser = makeUser({ address: '大阪府大阪市' });
      const updatedUser = makeUser({ address: '大阪府大阪市' });
      mockUsersService.findById.mockResolvedValue(currentUser);
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      await controller.updateProfile({ id: 1 }, { name: '山田太郎', address: undefined });

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(1, '山田太郎', '大阪府大阪市');
    });

    it('address が null の時は住所を削除すること', async () => {
      const currentUser = makeUser({ address: '大阪府大阪市' });
      const updatedUser = makeUser({ address: null });
      mockUsersService.findById.mockResolvedValue(currentUser);
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      await controller.updateProfile({ id: 1 }, { name: '山田太郎', address: null });

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(1, '山田太郎', null);
    });
  });

  // ── GET /users/me/orders ───────────────────────────────────
  describe('getOrders', () => {
    it('注文一覧をOrderSummaryDto形式（id/status/totalAmount/createdAtのみ）で返すこと', async () => {
      const orders = [makeOrder({ id: 2 }), makeOrder({ id: 1 })];
      mockUsersService.findOrdersByUserId.mockResolvedValue(orders);

      const result = await controller.getOrders({ id: 1 });

      expect(mockUsersService.findOrdersByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual([
        { id: 2, status: 'paid', totalAmount: 5000, createdAt: orders[0].createdAt },
        { id: 1, status: 'paid', totalAmount: 5000, createdAt: orders[1].createdAt },
      ]);
      // 余計なフィールドが含まれないこと
      expect(result[0]).not.toHaveProperty('shippingAddress');
      expect(result[0]).not.toHaveProperty('stripeSessionId');
    });

    it('注文がない場合は空配列を返すこと', async () => {
      mockUsersService.findOrdersByUserId.mockResolvedValue([]);

      const result = await controller.getOrders({ id: 1 });

      expect(result).toEqual([]);
    });
  });

  // ── DELETE /users/me ───────────────────────────────────────
  describe('withdraw', () => {
    it('退会成功時に undefined を返すこと', async () => {
      mockUsersService.withdraw.mockResolvedValue(undefined);

      const result = await controller.withdraw({ id: 1 });

      expect(mockUsersService.withdraw).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
