import { ConfigType } from '@nestjs/config';
import authConfig from 'src/auth/config/auth.config';
import { Response } from 'express';

const config: ConfigType<typeof authConfig> = authConfig();

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(config.cookie.name, token, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.pathRefreshToken,
    maxAge: config.cookie.maxAge,
  });
  res.cookie(config.cookie.name, token, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.pathLogout,
    maxAge: config.cookie.maxAge,
  });
}

export function clearRefreshTokenCookies(res: Response) {
  res.clearCookie(config.cookie.name, {
    path: config.cookie.pathRefreshToken,
  });
  res.clearCookie(config.cookie.name, {
    path: config.cookie.pathLogout,
  });
}
