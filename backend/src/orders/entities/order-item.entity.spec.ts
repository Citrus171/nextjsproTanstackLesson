import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

describe('OrderItemEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === OrderItemEntity);

  it('テーブル名がorder_itemsであること', () => {
    const entity = storage.tables.find((t) => t.target === OrderItemEntity);
    expect(entity?.name).toBe('order_items');
  });

  it('orderIdカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'orderId');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('variationIdカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'variationId');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('productIdカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'productId');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('productNameカラムが存在すること（スナップショット）', () => {
    expect(getColumns().find((c) => c.propertyName === 'productName')).toBeDefined();
  });

  it('sizeカラムが存在すること（スナップショット）', () => {
    expect(getColumns().find((c) => c.propertyName === 'size')).toBeDefined();
  });

  it('colorカラムが存在すること（スナップショット）', () => {
    expect(getColumns().find((c) => c.propertyName === 'color')).toBeDefined();
  });

  it('priceカラムがINT型で存在すること（スナップショット）', () => {
    const col = getColumns().find((c) => c.propertyName === 'price');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('ordersへのリレーション（orderId FK）が存在すること', () => {
    const joinCol = storage.joinColumns.find(
      (j) => j.target === OrderItemEntity && j.propertyName === 'order',
    );
    expect(joinCol?.name).toBe('orderId');
  });

  it('product_variationsへのリレーション（variationId FK）が存在すること', () => {
    const joinCol = storage.joinColumns.find(
      (j) => j.target === OrderItemEntity && j.propertyName === 'variation',
    );
    expect(joinCol?.name).toBe('variationId');
  });
});
