import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { ProductVariationEntity } from './product-variation.entity';

describe('ProductVariationEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === ProductVariationEntity);

  it('テーブル名がproduct_variationsであること', () => {
    const entity = storage.tables.find(
      (t) => t.target === ProductVariationEntity,
    );
    expect(entity?.name).toBe('product_variations');
  });

  it('stockカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'stock');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('sizeカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'size')).toBeDefined();
  });

  it('colorカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'color')).toBeDefined();
  });

  it('priceカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'price');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('deletedAtカラムが存在すること（論理削除）', () => {
    expect(
      getColumns().find((c) => c.propertyName === 'deletedAt'),
    ).toBeDefined();
  });
});
