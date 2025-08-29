import { registerAs } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

/**
 * Shared static values for Auth tests
 */
export const AUTH_CONFIG = {
  secret: 'secret-test',
  issuer: 'test-issuer',
  audience: 'test-audience',
  expiresIn: 300,
  refreshTokenExpiresIn: 60 * 60 * 24 * 7,
};

/**
 * Default export to mock Nest’s auth.config.ts
 */
export default registerAs('auth', () => ({
  secret: AUTH_CONFIG.secret,
  expiresIn: AUTH_CONFIG.expiresIn,
  refreshTokenExpiresIn: AUTH_CONFIG.refreshTokenExpiresIn,
  audience: AUTH_CONFIG.audience,
  issuer: AUTH_CONFIG.issuer,
  cookie: {
    name: 'refreshToken',
    httpOnly: true,
    secure: false,
    sameSite: 'strict' as const,
    pathRefreshToken: '/auth/refresh-token',
    pathLogout: '/auth/logout',
    maxAge: AUTH_CONFIG.refreshTokenExpiresIn * 1000,
  },
}));

/**
 * DTOs and Entities for Auth flow tests
 */
export const loginDto: LoginDto = {
  username: 'mark',
  password: 'Teste1234!',
};

export const invalidLoginDto: LoginDto = {
  username: 'mark',
  password: 'senhaErrada',
};

export const signupDto: CreateUserDto = {
  email: 'mark@example.com',
  username: 'mark',
  password: 'Teste1234!',
  profile: {
    firstName: 'Mark',
    lastName: 'Will',
    gender: undefined,
    dateOfBirth: undefined,
    bio: undefined,
    profileImage: undefined,
  },
};

export const userEntity = {
  id: 1,
  username: 'mark',
  email: 'mark@example.com',
  password: '$2b$10$HASH', // hash simulado
  createdAt: new Date('2025-08-12T18:31:00.556Z'),
  updatedAt: new Date('2025-08-12T18:31:00.556Z'),
  deletedAt: null,
  profile: undefined,
  tweets: undefined,
};

export const tokens = {
  accessToken: 'access.token.mock',
  refreshToken: 'refresh.token.mock',
};

export const refreshedTokens = {
  accessToken: 'new.access.token.mock',
  refreshToken: 'new.refresh.token.mock',
};

export const refreshPayload = {
  sub: userEntity.id,
  jti: 'jti-mock' as `${string}-${string}-${string}-${string}-${string}`,
};
