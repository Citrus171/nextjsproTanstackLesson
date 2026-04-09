import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';
import { UpdateTodoDto } from './update-todo.dto';

async function validateDto<T extends object>(
  cls: new () => T,
  plain: object,
) {
  const dto = plainToInstance(cls, plain);
  return validate(dto as object);
}

// ── CreateTodoDto ──────────────────────────────────────────────
describe('CreateTodoDto', () => {
  describe('title', () => {
    it('有効なtitleはエラーなし', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'NestJSを学ぶ' });
      expect(errors).toHaveLength(0);
    });

    it('titleが空文字はエラー (IsNotEmpty)', async () => {
      const errors = await validateDto(CreateTodoDto, { title: '' });
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('titleなしはエラー (IsNotEmpty)', async () => {
      const errors = await validateDto(CreateTodoDto, {});
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('数値はエラー (IsString)', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 123 });
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError?.constraints).toHaveProperty('isString');
    });
  });

  describe('description (省略可能)', () => {
    it('descriptionなしはエラーなし', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル' });
      expect(errors).toHaveLength(0);
    });

    it('有効なdescriptionはエラーなし', async () => {
      const errors = await validateDto(CreateTodoDto, {
        title: 'タイトル',
        description: 'Swaggerの設定から始める',
      });
      expect(errors).toHaveLength(0);
    });

    it('descriptionが数値はエラー (IsString)', async () => {
      const errors = await validateDto(CreateTodoDto, {
        title: 'タイトル',
        description: 42,
      });
      const err = errors.find((e) => e.property === 'description');
      expect(err?.constraints).toHaveProperty('isString');
    });
  });

  describe('priority (省略可能 / Min1 Max3)', () => {
    it('priorityなしはエラーなし', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル' });
      expect(errors).toHaveLength(0);
    });

    it.each([1, 2, 3])('priority=%i はエラーなし', async (p) => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル', priority: p });
      expect(errors).toHaveLength(0);
    });

    it('priority=0 はエラー (Min(1))', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル', priority: 0 });
      const err = errors.find((e) => e.property === 'priority');
      expect(err?.constraints).toHaveProperty('min');
    });

    it('priority=4 はエラー (Max(3))', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル', priority: 4 });
      const err = errors.find((e) => e.property === 'priority');
      expect(err?.constraints).toHaveProperty('max');
    });

    it('priority が文字列はエラー (IsNumber)', async () => {
      const errors = await validateDto(CreateTodoDto, { title: 'タイトル', priority: '2' });
      const err = errors.find((e) => e.property === 'priority');
      expect(err?.constraints).toHaveProperty('isNumber');
    });
  });
});

// ── UpdateTodoDto ──────────────────────────────────────────────
describe('UpdateTodoDto', () => {
  it('すべて省略はエラーなし (全フィールドOptional)', async () => {
    const errors = await validateDto(UpdateTodoDto, {});
    expect(errors).toHaveLength(0);
  });

  describe('title', () => {
    it('有効なtitleはエラーなし', async () => {
      const errors = await validateDto(UpdateTodoDto, { title: '更新タイトル' });
      expect(errors).toHaveLength(0);
    });

    it('titleが数値はエラー (IsString)', async () => {
      const errors = await validateDto(UpdateTodoDto, { title: 999 });
      const err = errors.find((e) => e.property === 'title');
      expect(err?.constraints).toHaveProperty('isString');
    });
  });

  describe('completed', () => {
    it('completed=true はエラーなし', async () => {
      const errors = await validateDto(UpdateTodoDto, { completed: true });
      expect(errors).toHaveLength(0);
    });

    it('completed=false はエラーなし', async () => {
      const errors = await validateDto(UpdateTodoDto, { completed: false });
      expect(errors).toHaveLength(0);
    });

    it('completed が文字列はエラー (IsBoolean)', async () => {
      const errors = await validateDto(UpdateTodoDto, { completed: 'true' });
      const err = errors.find((e) => e.property === 'completed');
      expect(err?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('priority (Min1 Max3)', () => {
    it.each([1, 2, 3])('priority=%i はエラーなし', async (p) => {
      const errors = await validateDto(UpdateTodoDto, { priority: p });
      expect(errors).toHaveLength(0);
    });

    it('priority=0 はエラー (Min(1))', async () => {
      const errors = await validateDto(UpdateTodoDto, { priority: 0 });
      const err = errors.find((e) => e.property === 'priority');
      expect(err?.constraints).toHaveProperty('min');
    });

    it('priority=4 はエラー (Max(3))', async () => {
      const errors = await validateDto(UpdateTodoDto, { priority: 4 });
      const err = errors.find((e) => e.property === 'priority');
      expect(err?.constraints).toHaveProperty('max');
    });
  });
});
