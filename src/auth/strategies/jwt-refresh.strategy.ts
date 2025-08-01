// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt'; // ✔️ Usando StrategyOptions aqui
import { ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import { cookieExtractor } from '../utils/cookie-extractor';
import { RefreshTokenPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.secret!,
      audience: config.audience,
      issuer: config.issuer,
      passReqToCallback: false,
    } satisfies StrategyOptions);
  }

  // não utiliza diretamente o método verify, porque o Passport-JWT já faz essa verificação internamente
  async validate(payload: RefreshTokenPayload): Promise<RefreshTokenPayload> {
    // payload.sub é o userId que geramos no refresh token
    return { sub: payload.sub, jti: payload.jti };
  }
}
