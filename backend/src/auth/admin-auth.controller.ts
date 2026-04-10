import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { AdminGuard } from "./guards/admin.guard";
import { SuperAdminGuard } from "./guards/super-admin.guard";

@ApiTags("auth")
@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  adminLogin(@Body() body: LoginDto) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Get("me")
  @UseGuards(AdminGuard)
  adminMe(@Req() req: { user: { id: number; role: "super" | "general" } }) {
    return { id: req.user.id, role: req.user.role };
  }

  @Get("super-only")
  @UseGuards(AdminGuard, SuperAdminGuard)
  superOnly() {
    return { ok: true };
  }
}
