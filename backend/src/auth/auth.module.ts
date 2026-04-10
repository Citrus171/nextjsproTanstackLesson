import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AdminUsersModule } from "../admin-users/admin-users.module";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AdminJwtStrategy } from "./strategies/admin-jwt.strategy";
import { AuthController } from "./auth.controller";
import { AdminAuthController } from "./admin-auth.controller";

@Module({
  imports: [
    UsersModule,
    AdminUsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "change-me-in-production",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminJwtStrategy],
  exports: [AuthService],
  controllers: [AuthController, AdminAuthController],
})
export class AuthModule {}
