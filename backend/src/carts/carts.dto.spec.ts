import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

async function validateDto<T extends object>(cls: new () => T, plain: object) {
  const dto = plainToInstance(cls, plain);
  return validate(dto as object);
}

describe('AddToCartDto', () => {
  it('有効なvariationIdとquantityの時、エラーがないこと', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 1, quantity: 2 });
    expect(errors).toHaveLength(0);
  });

  it('quantityを省略した時、エラーがないこと（任意フィールド）', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 1 });
    expect(errors).toHaveLength(0);
  });

  it('variationIdが0以下の時、エラーになること', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 0, quantity: 1 });
    const error = errors.find((e) => e.property === 'variationId');
    expect(error).toBeDefined();
  });

  it('variationIdが小数の時、エラーになること', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 1.5, quantity: 1 });
    const error = errors.find((e) => e.property === 'variationId');
    expect(error).toBeDefined();
  });

  it('quantityが0以下の時、エラーになること', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 1, quantity: 0 });
    const error = errors.find((e) => e.property === 'quantity');
    expect(error).toBeDefined();
  });

  it('quantityが小数の時、エラーになること', async () => {
    const errors = await validateDto(AddToCartDto, { variationId: 1, quantity: 1.5 });
    const error = errors.find((e) => e.property === 'quantity');
    expect(error).toBeDefined();
  });
});

describe('UpdateCartItemDto', () => {
  it('有効なquantityの時、エラーがないこと', async () => {
    const errors = await validateDto(UpdateCartItemDto, { quantity: 3 });
    expect(errors).toHaveLength(0);
  });

  it('quantityが0以下の時、エラーになること', async () => {
    const errors = await validateDto(UpdateCartItemDto, { quantity: 0 });
    const error = errors.find((e) => e.property === 'quantity');
    expect(error).toBeDefined();
  });

  it('quantityが省略された時、エラーになること', async () => {
    const errors = await validateDto(UpdateCartItemDto, {});
    const error = errors.find((e) => e.property === 'quantity');
    expect(error).toBeDefined();
  });

  it('quantityが小数の時、エラーになること', async () => {
    const errors = await validateDto(UpdateCartItemDto, { quantity: 2.5 });
    const error = errors.find((e) => e.property === 'quantity');
    expect(error).toBeDefined();
  });
});
