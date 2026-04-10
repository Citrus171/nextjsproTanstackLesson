import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { CartEntity } from './cart.entity';

describe('CartEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === CartEntity);

  it('テーブル名がcartsであること', () => {
    const entity = storage.tables.find((t) => t.target === CartEntity);
    expect(entity?.name).toBe('carts');
  });

  it('sessionIdカラムが存在すること', () => {
    expect(
      getColumns().find((c) => c.propertyName === 'sessionId'),
    ).toBeDefined();
  });

  it('variationIdカラムが存在すること', () => {
    expect(
      getColumns().find((c) => c.propertyName === 'variationId'),
    ).toBeDefined();
  });

  it('quantityカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'quantity');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('reservedAtカラムが存在すること', () => {
    expect(
      getColumns().find((c) => c.propertyName === 'reservedAt'),
    ).toBeDefined();
  });

  it('expiresAtカラムが存在すること', () => {
    expect(
      getColumns().find((c) => c.propertyName === 'expiresAt'),
    ).toBeDefined();
  });

  it('product_variationsへのリレーションが存在すること', () => {
    const rel = storage.relations.find(
      (r) => r.target === CartEntity && r.propertyName === 'variation',
    );
    expect(rel).toBeDefined();
  });
});
