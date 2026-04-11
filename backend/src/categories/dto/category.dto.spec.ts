import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

describe('CategoryDtos', () => {
  describe('CreateCategoryDto', () => {
    it('name が空の場合はバリデーションエラーになること', async () => {
      const dto = plainToInstance(CreateCategoryDto, { name: '', parentId: null });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('name が50文字超の場合はバリデーションエラーになること', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: 'a'.repeat(51),
        parentId: null,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('parentId が省略可能であること', async () => {
      const dto = plainToInstance(CreateCategoryDto, { name: '衣類' });
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });

    it('parentId が null でもバリデーションエラーにならないこと', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: '衣類',
        parentId: null,
      });
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });

    it('parentId が整数の場合はバリデーションエラーにならないこと', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: '衣類',
        parentId: 1,
      });
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });

    it('valid な CreateCategoryDto はエラーがないこと', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        name: '衣類',
        parentId: 1,
      });
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });
  });

  describe('UpdateCategoryDto', () => {
    it('空のオブジェクトでもバリデーションエラーにならないこと', async () => {
      const dto = plainToInstance(UpdateCategoryDto, {});
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });

    it('name が50文字超の場合はバリデーションエラーになること', async () => {
      const dto = plainToInstance(UpdateCategoryDto, {
        name: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('name と parentId の両方が指定されてもバリデーションエラーにならないこと', async () => {
      const dto = plainToInstance(UpdateCategoryDto, {
        name: '新しい衣類',
        parentId: 2,
      });
      const errors = await validate(dto);
      expect(errors).toEqual([]);
    });
  });
});
