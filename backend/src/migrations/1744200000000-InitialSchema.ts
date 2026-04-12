import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744200000000 implements MigrationInterface {
  name = 'InitialSchema1744200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`address\` VARCHAR(255) NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`deletedAt\` DATETIME(6) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`admin_users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('super','general') NOT NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`deletedAt\` DATETIME(6) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`categories\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`parentId\` INT NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_categories_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`products\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`price\` INT NOT NULL,
        \`categoryId\` INT NULL,
        \`isPublished\` TINYINT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` DATETIME(6) NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_products_category\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_images\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`productId\` INT NOT NULL,
        \`url\` VARCHAR(255) NOT NULL,
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_product_images_product\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_variations\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`productId\` INT NOT NULL,
        \`size\` VARCHAR(255) NOT NULL,
        \`color\` VARCHAR(255) NOT NULL,
        \`price\` INT NOT NULL,
        \`stock\` INT NOT NULL DEFAULT 0,
        \`imageUrl\` VARCHAR(255) NULL,
        \`deletedAt\` DATETIME(6) NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_product_variations_product\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`carts\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`sessionId\` VARCHAR(255) NOT NULL,
        \`variationId\` INT NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`reservedAt\` DATETIME NOT NULL,
        \`expiresAt\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_carts_variation\` FOREIGN KEY (\`variationId\`) REFERENCES \`product_variations\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`orders\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`userId\` INT NOT NULL,
        \`status\` ENUM('pending','paid','shipped','delivered','cancelled','refunded') NOT NULL,
        \`shippingAddress\` JSON NOT NULL,
        \`shippingFee\` INT NOT NULL,
        \`totalAmount\` INT NOT NULL,
        \`stripeSessionId\` VARCHAR(255) NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_orders_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`order_items\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`orderId\` INT NOT NULL,
        \`variationId\` INT NOT NULL,
        \`productId\` INT NOT NULL,
        \`productName\` VARCHAR(255) NOT NULL,
        \`size\` VARCHAR(255) NOT NULL,
        \`color\` VARCHAR(255) NOT NULL,
        \`quantity\` INT NOT NULL,
        \`price\` INT NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_order_items_order\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_order_items_variation\` FOREIGN KEY (\`variationId\`) REFERENCES \`product_variations\`(\`id\`),
        CONSTRAINT \`FK_order_items_product\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`store_settings\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`invoiceNumber\` VARCHAR(255) NULL,
        \`shippingFixedFee\` INT NOT NULL,
        \`shippingFreeThreshold\` INT NOT NULL,
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(
      'INSERT INTO `store_settings` (`shippingFixedFee`, `shippingFreeThreshold`) VALUES (800, 5000)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`order_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`orders\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`carts\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`product_variations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`product_images\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`products\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`categories\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`admin_users\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`store_settings\``);
  }
}
