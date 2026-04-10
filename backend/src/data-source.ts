import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './users/entities/user.entity';
import { AdminUserEntity } from './admin-users/entities/admin-user.entity';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { ProductImageEntity } from './products/entities/product-image.entity';
import { ProductVariationEntity } from './products/entities/product-variation.entity';
import { CartEntity } from './carts/entities/cart.entity';
import { OrderEntity } from './orders/entities/order.entity';
import { OrderItemEntity } from './orders/entities/order-item.entity';
import { StoreSettingsEntity } from './store-settings/entities/store-settings.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'ec_db',
  entities: [
    UserEntity,
    AdminUserEntity,
    CategoryEntity,
    ProductEntity,
    ProductImageEntity,
    ProductVariationEntity,
    CartEntity,
    OrderEntity,
    OrderItemEntity,
    StoreSettingsEntity,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
