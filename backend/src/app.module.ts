import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StoreSettingsModule } from './store-settings/store-settings.module';
import { CartsModule } from './carts/carts.module';
import { AdminUserEntity } from './admin-users/entities/admin-user.entity';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { ProductImageEntity } from './products/entities/product-image.entity';
import { ProductVariationEntity } from './products/entities/product-variation.entity';
import { CartEntity } from './carts/entities/cart.entity';
import { OrderEntity } from './orders/entities/order.entity';
import { OrderItemEntity } from './orders/entities/order-item.entity';
import { StoreSettingsEntity } from './store-settings/entities/store-settings.entity';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
      },
    }),
    TypeOrmModule.forRoot({
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
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    HealthModule,
    CategoriesModule,
    ProductsModule,
    StoreSettingsModule,
    CartsModule,
  ],
})
export class AppModule {}
