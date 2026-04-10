import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { AdminUserEntity } from './admin-user.entity';

describe('AdminUserEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === AdminUserEntity);

  it('テーブル名がadmin_usersであること', () => {
    const entity = storage.tables.find((t) => t.target === AdminUserEntity);
    expect(entity?.name).toBe('admin_users');
  });

  it('emailカラムがunique制約付きで存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'email');
    expect(col).toBeDefined();
    expect((col?.options as { unique?: boolean })?.unique).toBe(true);
  });

  it('passwordカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'password')).toBeDefined();
  });

  it('nameカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'name')).toBeDefined();
  });

  it("roleカラムがenum('super','general')で存在すること", () => {
    const col = getColumns().find((c) => c.propertyName === 'role');
    expect(col).toBeDefined();
    const opts = col?.options as { type?: string; enum?: string[] };
    expect(opts?.enum).toEqual(['super', 'general']);
  });

  it('deletedAtカラムが存在すること（論理削除）', () => {
    const col = getColumns().find((c) => c.propertyName === 'deletedAt');
    expect(col).toBeDefined();
  });
});
