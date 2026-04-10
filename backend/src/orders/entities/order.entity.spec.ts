import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { OrderEntity } from './order.entity';

describe('OrderEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === OrderEntity);

  it('テーブル名がordersであること', () => {
    const entity = storage.tables.find((t) => t.target === OrderEntity);
    expect(entity?.name).toBe('orders');
  });

  it('statusカラムがenum型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'status');
    expect(col).toBeDefined();
    const opts = col?.options as { enum?: string[] };
    expect(opts?.enum).toEqual([
      'pending',
      'paid',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ]);
  });

  it('shippingAddressカラムがJSON型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'shippingAddress');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('json');
  });

  it('shippingFeeカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'shippingFee');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('totalAmountカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'totalAmount');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('stripeSessionIdカラムがnullableで存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'stripeSessionId');
    expect(col).toBeDefined();
    expect((col?.options as { nullable?: boolean })?.nullable).toBe(true);
  });

  it('usersへのリレーションが存在すること', () => {
    const rel = storage.relations.find(
      (r) => r.target === OrderEntity && r.propertyName === 'user',
    );
    expect(rel).toBeDefined();
  });
});
