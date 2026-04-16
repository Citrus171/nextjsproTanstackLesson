import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "nestjs-pino";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
// import { HealthModule } from "./health/health.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { StoreSettingsModule } from "./store-settings/store-settings.module";
import { CartsModule } from "./carts/carts.module";
// import { PaymentsModule } from "./payments/payments.module";
// import { AdminMembersModule } from "./admin-members/admin-members.module";
// import { AdminOrdersModule } from "./admin-orders/admin-orders.module";

@Module({
  imports: [
    PrismaModule,
    SentryModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: { colorize: true, singleLine: true },
              }
            : undefined,
      },
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    // HealthModule,
    CategoriesModule,
    ProductsModule,
    StoreSettingsModule,
    CartsModule,
    // PaymentsModule,
    // AdminMembersModule,
    // AdminOrdersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
