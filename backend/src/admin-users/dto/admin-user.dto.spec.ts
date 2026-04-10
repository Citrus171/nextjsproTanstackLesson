import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAdminUserDto } from './create-admin-user.dto';
import { UpdateAdminUserDto } from './update-admin-user.dto';

describe('CreateAdminUserDto バリデーション', () => {
  it('有効なDTOでバリデーション成功すること', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'admin@example.com',
      password: 'password123',
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('nameがない時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      email: 'admin@example.com',
      password: 'password123',
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('emailがない時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      password: 'password123',
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('emailが無効形式時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'invalid-email',
      password: 'password123',
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('passwordが8文字未満時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'admin@example.com',
      password: 'short',
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('roleがない時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'admin@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('roleが super でも general でもない時、バリデーションエラー', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'admin@example.com',
      password: 'password123',
      role: 'invalid',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('general ロール も有効', async () => {
    const dto = plainToInstance(CreateAdminUserDto, {
      name: '管理者',
      email: 'admin@example.com',
      password: 'password123',
      role: 'general',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});

describe('UpdateAdminUserDto バリデーション', () => {
  it('全フィールド省略可能（空オブジェクト）でバリデーション成功', async () => {
    const dto = plainToInstance(UpdateAdminUserDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('nameのみ更新', async () => {
    const dto = plainToInstance(UpdateAdminUserDto, {
      name: '新しい名前',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('roleのみ更新', async () => {
    const dto = plainToInstance(UpdateAdminUserDto, {
      role: 'super',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('roleが無効値の場合、バリデーションエラー', async () => {
    const dto = plainToInstance(UpdateAdminUserDto, {
      role: 'invalid',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('nameとroleの両方更新', async () => {
    const dto = plainToInstance(UpdateAdminUserDto, {
      name: '新しい名前',
      role: 'general',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
