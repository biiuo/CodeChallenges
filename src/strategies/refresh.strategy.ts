import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract from Authorization header
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      ignoreExpiration: false,
    });
  }
  validate(payload: any) { 
    return { 
      userId: payload.sub, 
      role: payload.role // Changed from roles to role (singular)
    }; 
  }
}
