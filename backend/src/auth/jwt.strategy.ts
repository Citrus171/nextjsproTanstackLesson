import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: number;
  type: 'user';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'user') throw new UnauthorizedException('無効なトークンです');
    try {
      await this.usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('アカウントは無効です');
    }
    return { id: payload.sub };
  }
}
