import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { AdminAccountsController } from "./admin-accounts.controller";
import { AdminUsersService } from "./admin-users.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";

const makeAdminResponse = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "管理者",
  email: "admin@example.com",
  role: "general" as const,
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

describe("AdminAccountsController", () => {
  let controller: AdminAccountsController;
  let service: jest.Mocked<AdminUsersService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<Partial<AdminUsersService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAccountsController],
      providers: [{ provide: AdminUsersService, useValue: mockService }],
    }).compile();

    controller = module.get<AdminAccountsController>(AdminAccountsController);
    service = module.get(AdminUsersService) as jest.Mocked<AdminUsersService>;
  });

  describe("create", () => {
    it("有効なDTOでアカウント作成され、レスポンスを返すこと", async () => {
      const dto: CreateAdminUserDto = {
        name: "新管理者",
        email: "new@example.com",
        password: "password123",
        role: "super",
      };

      const response = makeAdminResponse({
        id: 2,
        name: "新管理者",
        email: "new@example.com",
        role: "super",
      });

      service.create.mockResolvedValue(response);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(
        "新管理者",
        "new@example.com",
        "password123",
        "super",
      );
      expect(result).toEqual(response);
    });
  });

  describe("findAll", () => {
    it("全管理者一覧を返すこと", async () => {
      const admins = [
        makeAdminResponse({ id: 1 }),
        makeAdminResponse({ id: 2, name: "別の管理者" }),
      ];

      service.findAll.mockResolvedValue(admins);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(admins);
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("指定IDの管理者詳細を返すこと", async () => {
      const admin = makeAdminResponse({ id: 5 });
      service.findById.mockResolvedValue(admin);

      const result = await controller.findById(5);

      expect(service.findById).toHaveBeenCalledWith(5);
      expect(result).toEqual(admin);
    });

    it("存在しないID時、NotFoundException投げること", async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("有効なDTOでアカウント更新され、更新後レスポンスを返すこと", async () => {
      const dto: UpdateAdminUserDto = {
        name: "更新名",
        role: "super",
      };

      const updated = makeAdminResponse({
        id: 5,
        name: "更新名",
        role: "super",
      });

      service.update.mockResolvedValue(updated);

      const result = await controller.update(5, dto);

      expect(service.update).toHaveBeenCalledWith(5, dto);
      expect(result).toEqual(updated);
    });

    it("存在しないID時、NotFoundException投げること", async () => {
      service.update.mockResolvedValue(null);

      const dto: UpdateAdminUserDto = { name: "新名前" };

      await expect(controller.update(999, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("指定IDのアカウントを論理削除すること", async () => {
      service.softDelete.mockResolvedValue(true);

      await controller.delete(5);

      expect(service.softDelete).toHaveBeenCalledWith(5);
    });

    it("存在しないID時、NotFoundException投げること", async () => {
      service.softDelete.mockResolvedValue(false);

      await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
