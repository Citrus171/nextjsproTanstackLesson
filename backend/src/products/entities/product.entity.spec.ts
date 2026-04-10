import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { ProductEntity } from './product.entity';

describe('ProductEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === ProductEntity);

  it('テーブル名がproductsであること', () => {
    const entity = storage.tables.find((t) => t.target === ProductEntity);
    expect(entity?.name).toBe('products');
  });

  it('nameカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'name')).toBeDefined();
  });

  it('priceカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'price');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('stockカラムが存在しないこと（バリエーションで管理）', () => {
    const col = getColumns().find((c) => c.propertyName === 'stock');
    expect(col).toBeUndefined();
  });

  it('isPublishedプロパティのカラムが存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'isPublished');
    expect(col).toBeDefined();
  });

  it('deletedAtカラムが存在すること（論理削除）', () => {
    const col = getColumns().find((c) => c.propertyName === 'deletedAt');
    expect(col).toBeDefined();
  });

  it('categoryへのリレーションが存在すること', () => {
    const rel = storage.relations.find(
      (r) => r.target === ProductEntity && r.propertyName === 'category',
    );
    expect(rel).toBeDefined();
  });
});
