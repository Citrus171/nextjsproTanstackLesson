import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCartStatus1744200001000 implements MigrationInterface {
  name = 'AddCartStatus1744200001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`carts\`
      ADD COLUMN \`status\` ENUM('reserved', 'purchased', 'expired') NOT NULL DEFAULT 'reserved'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`carts\`
      DROP COLUMN \`status\`
    `);
  }
}
