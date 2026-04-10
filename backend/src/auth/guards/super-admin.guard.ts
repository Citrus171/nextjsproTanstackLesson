import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    if (user?.role !== "super") {
      throw new ForbiddenException("スーパー管理者権限が必要です");
    }
    return true;
  }
}
