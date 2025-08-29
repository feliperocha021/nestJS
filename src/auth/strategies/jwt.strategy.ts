import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import { AccessTokenPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {
    // note que importamos StrategyOptionsWithoutRequest
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret!,
      audience: config.audience,
      issuer: config.issuer,
      passReqToCallback: false,
    };

    super(options);
  }

  // não utiliza diretamente o método verify, porque o Passport-JWT já faz essa verificação internamente
  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayload> {
    return { sub: payload.sub, username: payload.username };
  }
}
