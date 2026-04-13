import { Test, TestingModule } from "@nestjs/testing";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrderListDto } from "./dto/admin-order-list.dto";
import { AdminOrderDetailDto } from "./dto/admin-order-detail.dto";

const mockAdminOrdersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
  cancelOrder: jest.fn(),
};

const stubListItem = {
  id: 1,
  status: "paid" as const,
  totalAmount: 10500,
  createdAt: new Date("2024-03-01"),
  user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
};

const stubDetail: AdminOrderDetailDto = {
  id: 1,
  status: "paid",
  shippingAddress: {
    zip: "100-0001",
    prefecture: "東京都",
    city: "千代田区",
    address1: "1-1",
  },
  shippingFee: 500,
  totalAmount: 10500,
  createdAt: new Date("2024-03-01"),
  user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
  items: [
    {
      id: 1,
      productName: "テストシャツ",
      size: "M",
      color: "white",
      quantity: 2,
      price: 5000,
    },
  ],
};

describe("AdminOrdersController", () => {
  let controller: AdminOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [
        {
          provide: AdminOrdersService,
          useValue: mockAdminOrdersService,
        },
      ],
    }).compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("page/limit付きで注文一覧を返すこと", async () => {
      const dto: AdminOrderListDto = {
        items: [stubListItem],
        page: 1,
        limit: 20,
        total: 1,
      };
      mockAdminOrdersService.findAll.mockResolvedValue(dto);

      const result = await controller.findAll(1, 20, undefined);

      expect(mockAdminOrdersService.findAll).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(dto);
    });

    it("statusフィルターが指定された場合サービスへ渡すこと", async () => {
      const dto: AdminOrderListDto = { items: [], page: 1, limit: 20, total: 0 };
      mockAdminOrdersService.findAll.mockResolvedValue(dto);

      await controller.findAll(1, 20, "shipped");

      expect(mockAdminOrdersService.findAll).toHaveBeenCalledWith(1, 20, "shipped");
    });
  });

  describe("findById", () => {
    it("注文詳細を返すこと", async () => {
      mockAdminOrdersService.findById.mockResolvedValue(stubDetail);

      const result = await controller.findById(1);

      expect(mockAdminOrdersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(stubDetail);
    });
  });

  describe("updateStatus", () => {
    it("ステータス更新をサービスに委譲してvoidを返すこと", async () => {
      mockAdminOrdersService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus(1, { status: "shipped" });

      expect(mockAdminOrdersService.updateStatus).toHaveBeenCalledWith(1, "shipped");
      expect(result).toBeUndefined();
    });
  });

  describe("cancelOrder", () => {
    it("キャンセルをサービスに委譲してvoidを返すこと", async () => {
      mockAdminOrdersService.cancelOrder.mockResolvedValue(undefined);

      const result = await controller.cancelOrder(1);

      expect(mockAdminOrdersService.cancelOrder).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
