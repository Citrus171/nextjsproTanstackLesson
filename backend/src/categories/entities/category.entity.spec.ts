import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { CategoryEntity } from './category.entity';

describe('CategoryEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === CategoryEntity);

  it('テーブル名がcategoriesであること', () => {
    const entity = storage.tables.find((t) => t.target === CategoryEntity);
    expect(entity?.name).toBe('categories');
  });

  it('nameカラムが存在すること', () => {
    expect(getColumns().find((c) => c.propertyName === 'name')).toBeDefined();
  });

  it('parentIdカラムがnullable で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'parentId');
    expect(col).toBeDefined();
    expect((col?.options as { nullable?: boolean })?.nullable).toBe(true);
  });

  it('自己参照リレーション（parent_id FK）が存在すること', () => {
    const rel = storage.relations.find(
      (r) => r.target === CategoryEntity && r.propertyName === 'parent',
    );
    expect(rel).toBeDefined();
  });
});
