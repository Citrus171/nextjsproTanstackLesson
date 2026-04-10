import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { LoginDto } from "./login.dto";
import { RegisterDto } from "./register.dto";

async function validateDto<T extends object>(cls: new () => T, plain: object) {
  const dto = plainToInstance(cls, plain);
  return validate(dto as object);
}

describe("RegisterDto", () => {
  it("有効なメールアドレスとパスワードの時、エラーがないこと", async () => {
    const errors = await validateDto(RegisterDto, {
      email: "user@example.com",
      password: "password123",
    });
    expect(errors).toHaveLength(0);
  });

  it("メールアドレス形式が不正な時、emailがエラーになること", async () => {
    const errors = await validateDto(RegisterDto, {
      email: "invalid-email",
      password: "password123",
    });
    const emailError = errors.find((e) => e.property === "email");
    expect(emailError?.constraints).toHaveProperty("isEmail");
  });

  it("パスワードが8文字未満の時、passwordがエラーになること", async () => {
    const errors = await validateDto(RegisterDto, {
      email: "user@example.com",
      password: "short",
    });
    const passwordError = errors.find((e) => e.property === "password");
    expect(passwordError?.constraints).toHaveProperty("minLength");
  });
});

describe("LoginDto", () => {
  it("有効なメールアドレスとパスワードの時、エラーがないこと", async () => {
    const errors = await validateDto(LoginDto, {
      email: "user@example.com",
      password: "password123",
    });
    expect(errors).toHaveLength(0);
  });

  it("メールアドレス形式が不正な時、emailがエラーになること", async () => {
    const errors = await validateDto(LoginDto, {
      email: "invalid-email",
      password: "password123",
    });
    const emailError = errors.find((e) => e.property === "email");
    expect(emailError?.constraints).toHaveProperty("isEmail");
  });

  it("パスワードが空文字の時、passwordがエラーになること", async () => {
    const errors = await validateDto(LoginDto, {
      email: "user@example.com",
      password: "",
    });
    const passwordError = errors.find((e) => e.property === "password");
    expect(passwordError?.constraints).toHaveProperty("isNotEmpty");
  });
});
