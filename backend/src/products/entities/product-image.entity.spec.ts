import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { ProductImageEntity } from './product-image.entity';

describe('ProductImageEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === ProductImageEntity);

  it('テーブル名がproduct_imagesであること', () => {
    const entity = storage.tables.find((t) => t.target === ProductImageEntity);
    expect(entity?.name).toBe('product_images');
  });

  it('productIdカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'productId');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('urlカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'url')).toBeDefined();
  });

  it('sortOrderカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'sortOrder');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('productsへのリレーション（productId FK）が存在すること', () => {
    const rel = storage.relations.find(
      (r) => r.target === ProductImageEntity && r.propertyName === 'product',
    );
    expect(rel).toBeDefined();
    const joinCol = storage.joinColumns.find(
      (j) => j.target === ProductImageEntity && j.propertyName === 'product',
    );
    expect(joinCol?.name).toBe('productId');
  });
});
