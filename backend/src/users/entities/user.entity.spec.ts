import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  const storage = getMetadataArgsStorage();

  const getColumns = () =>
    storage.columns.filter((c) => c.target === UserEntity);
  const getEntity = () =>
    storage.tables.find((t) => t.target === UserEntity);

  it('テーブル名がusersであること', () => {
    expect(getEntity()?.name).toBe('users');
  });

  it('idカラムが存在すること（PrimaryGeneratedColumn）', () => {
    const pk = storage.columns.find(
      (c) => c.target === UserEntity && c.propertyName === 'id',
    );
    expect(pk).toBeDefined();
  });

  it('emailカラムがunique制約付きで存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'email');
    expect(col).toBeDefined();
    expect((col?.options as { unique?: boolean })?.unique).toBe(true);
  });

  it('passwordカラムが存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'password');
    expect(col).toBeDefined();
  });

  it('nameカラムが存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'name');
    expect(col).toBeDefined();
  });

  it('addressカラムが存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'address');
    expect(col).toBeDefined();
  });

  it('deletedAtカラムが存在すること（論理削除）', () => {
    const deletedAt = storage.columns.find(
      (c) => c.target === UserEntity && c.propertyName === 'deletedAt',
    );
    expect(deletedAt).toBeDefined();
  });
});
