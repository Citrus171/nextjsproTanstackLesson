import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeEvents1744300000000 implements MigrationInterface {
  name = 'AddStripeEvents1744300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`stripe_events\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`eventId\` VARCHAR(255) NOT NULL UNIQUE,
        \`processedAt\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD UNIQUE INDEX \`UQ_orders_stripe_session_id\` (\`stripeSessionId\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP INDEX \`UQ_orders_stripe_session_id\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`stripe_events\``);
  }
}
