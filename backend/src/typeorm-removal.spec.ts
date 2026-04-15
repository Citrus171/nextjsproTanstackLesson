import { existsSync } from 'fs';
import { join } from 'path';

describe('TypeORM Removal', () => {
  it('TypeORM パッケージが削除されていること', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('typeorm');
    }).toThrow(/Cannot find module 'typeorm'/);
  });

  it('@nestjs/typeorm パッケージが削除されていること', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@nestjs/typeorm');
    }).toThrow(/Cannot find module '@nestjs\/typeorm'/);
  });

  it('data-source.ts が削除されていること', () => {
    const dataSourcePath = join(process.cwd(), 'src', 'data-source.ts');
    expect(existsSync(dataSourcePath)).toBe(false);
  });

  it('マイグレーションファイルが削除されていること', () => {
    const migrationsDir = join(process.cwd(), 'src', 'migrations');
    expect(existsSync(migrationsDir)).toBe(false);
  });
});