export interface AccessTokenPayload {
  sub: number;
  username: string;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}
