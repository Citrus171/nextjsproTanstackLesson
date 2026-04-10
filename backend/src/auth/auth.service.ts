import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminUsersService: AdminUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');

    const payload = { sub: user.id, type: 'user' as const };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async adminLogin(email: string, password: string) {
    const admin = await this.adminUsersService.findByEmail(email);
    if (!admin) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');

    const payload = { sub: admin.id, type: 'admin' as const, role: admin.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
