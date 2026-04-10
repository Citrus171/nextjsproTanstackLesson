import { Test, TestingModule } from "@nestjs/testing";
import { AdminAuthController } from "./admin-auth.controller";
import { AuthService } from "./auth.service";

const mockAuthService = {
  adminLogin: jest.fn(),
};

const adminRequest = {
  user: {
    id: 10,
    role: "super" as const,
  },
};

describe("AdminAuthController", () => {
  let controller: AdminAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
    jest.clearAllMocks();
  });

  describe("adminLogin", () => {
    it("有効な認証情報の時、adminLoginサービスを呼びアクセストークンを返すこと", async () => {
      const expected = { accessToken: "admin-jwt-token" };
      mockAuthService.adminLogin.mockResolvedValue(expected);

      const result = await controller.adminLogin({
        email: "admin@example.com",
        password: "password123",
      });

      expect(mockAuthService.adminLogin).toHaveBeenCalledWith(
        "admin@example.com",
        "password123",
      );
      expect(result).toEqual(expected);
    });

    it("サービスがエラーを投げた時、エラーが伝播すること", async () => {
      mockAuthService.adminLogin.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        controller.adminLogin({ email: "bad@example.com", password: "wrong" }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("adminMe", () => {
    it("認証済み管理者のidとroleを返すこと", () => {
      expect(controller.adminMe(adminRequest)).toEqual({
        id: 10,
        role: "super",
      });
    });
  });

  describe("superOnly", () => {
    it("到達した時、ok:trueを返すこと", () => {
      expect(controller.superOnly()).toEqual({ ok: true });
    });
  });
});
