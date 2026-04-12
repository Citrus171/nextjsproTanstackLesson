import { Test, TestingModule } from "@nestjs/testing";
import { AdminMembersController } from "./admin-members.controller";
import { AdminMembersService } from "./admin-members.service";
import { AdminMemberListDto } from "./dto/admin-member-list.dto";
import { AdminMemberDetailDto } from "./dto/admin-member-detail.dto";

const mockAdminMembersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  softDelete: jest.fn(),
};

describe("AdminMembersController", () => {
  let controller: AdminMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminMembersController],
      providers: [
        { provide: AdminMembersService, useValue: mockAdminMembersService },
      ],
    }).compile();

    controller = module.get<AdminMembersController>(AdminMembersController);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("page/limit付きで会員一覧を返す", async () => {
      const dto: AdminMemberListDto = {
        items: [
          {
            id: 1,
            name: "山田太郎",
            email: "test@example.com",
            createdAt: new Date("2024-01-01"),
            deletedAt: null,
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      };
      mockAdminMembersService.findAll.mockResolvedValue(dto);

      const result = await controller.findAll(1, 20);

      expect(mockAdminMembersService.findAll).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(dto);
    });
  });

  describe("findById", () => {
    it("管理者会員詳細を返す", async () => {
      const dto: AdminMemberDetailDto = {
        id: 1,
        name: "山田太郎",
        email: "test@example.com",
        address: null,
        createdAt: new Date("2024-01-01"),
        deletedAt: null,
        orders: [
          {
            id: 1,
            status: "paid",
            totalAmount: 10000,
            createdAt: new Date("2024-01-01"),
          },
        ],
      };
      mockAdminMembersService.findById.mockResolvedValue(dto);

      const result = await controller.findById(1);

      expect(mockAdminMembersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(dto);
    });
  });

  describe("delete", () => {
    it("存在するIDを削除するとvoidを返す", async () => {
      mockAdminMembersService.softDelete.mockResolvedValue(true);

      const result = await controller.delete(1);

      expect(mockAdminMembersService.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
