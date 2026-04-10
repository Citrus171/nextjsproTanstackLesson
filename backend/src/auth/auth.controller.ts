import { Body, Controller, Get, Req, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { AdminGuard } from "./guards/admin.guard";
import { SuperAdminGuard } from "./guards/super-admin.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post("admin/login")
  adminLogin(@Body() body: LoginDto) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Get("admin/me")
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  adminMe(@Req() req: { user: { id: number; role: "super" | "general" } }) {
    return { id: req.user.id, role: req.user.role };
  }

  @Get("admin/super-only")
  @ApiBearerAuth()
  @UseGuards(AdminGuard, SuperAdminGuard)
  superOnly() {
    return { ok: true };
  }
}
