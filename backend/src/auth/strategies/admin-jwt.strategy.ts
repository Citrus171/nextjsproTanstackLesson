import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AdminRole } from '../../admin-users/entities/admin-user.entity';

export interface AdminJwtPayload {
  sub: number;
  type: 'admin';
  role: AdminRole;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  validate(payload: AdminJwtPayload) {
    if (payload.type !== 'admin') throw new UnauthorizedException('無効なトークンです');
    return { id: payload.sub, role: payload.role };
  }
}
