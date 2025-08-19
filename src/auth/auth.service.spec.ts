import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

import authConfig from './config/auth.config';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { RedisJtiProvider } from './provider/redis-jti.provider';

import {
  loginDto,
  signupDto,
  userEntity,
  tokens,
  refreshPayload,
  AUTH_CONFIG,
} from './__mocks__/auth.mock';

describe('AuthService', () => {
  let authService: AuthService;

  // Mocks das dependências
  let mockUserService: {
    findUserByUsername: jest.Mock;
    createUser: jest.Mock;
    findUserById: jest.Mock;
  };
  let mockHashingProvider: { comparePassword: jest.Mock };
  let mockJwtService: { signAsync: jest.Mock };
  let mockRedisJtiProvider: {
    cleanupExpiredJtis: jest.Mock;
    addJti: jest.Mock;
    isValidJti: jest.Mock;
    removeJti: jest.Mock;
  };

  beforeEach(async () => {
    // Força sempre o mesmo JTI para podermos testar chamadas a addJti/removeJti
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(refreshPayload.jti);

    mockUserService = {
      findUserByUsername: jest.fn(),
      createUser: jest.fn(),
      findUserById: jest.fn(),
    };
    mockHashingProvider = {
      comparePassword: jest.fn(),
    };
    mockJwtService = {
      signAsync: jest.fn(),
    };
    mockRedisJtiProvider = {
      cleanupExpiredJtis: jest.fn(),
      addJti: jest.fn(),
      isValidJti: jest.fn(),
      removeJti: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: authConfig.KEY, useValue: AUTH_CONFIG },
        { provide: UserService, useValue: mockUserService },
        { provide: HashingProvider, useValue: mockHashingProvider },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisJtiProvider, useValue: mockRedisJtiProvider },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login()', () => {
    it('shoud throw UnauthorizedException if user does not exist', async () => {
      mockUserService.findUserByUsername.mockResolvedValue(undefined);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('shoud throw UnauthorizedException if the password is incorrect', async () => {
      mockUserService.findUserByUsername.mockResolvedValue(userEntity);
      mockHashingProvider.comparePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate and return tokens when credentials they are valid', async () => {
      mockUserService.findUserByUsername.mockResolvedValue(userEntity);
      mockHashingProvider.comparePassword.mockResolvedValue(true);
      mockRedisJtiProvider.cleanupExpiredJtis.mockResolvedValue(undefined);

      // Primeiro signAsync retorna accessToken, depois refreshToken
      mockJwtService.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await authService.login(loginDto);

      expect(mockRedisJtiProvider.cleanupExpiredJtis).toHaveBeenCalledWith(
        userEntity.id.toString(),
      );

      expect(mockRedisJtiProvider.addJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
        AUTH_CONFIG.refreshTokenExpiresIn,
      );

      expect(result).toEqual({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    });
  });

  describe('signup()', () => {
    it('should create user and return tokens', async () => {
      mockUserService.createUser.mockResolvedValue(userEntity);

      mockJwtService.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await authService.signup(signupDto);

      expect(mockUserService.createUser).toHaveBeenCalledWith(signupDto);

      expect(mockRedisJtiProvider.addJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
        AUTH_CONFIG.refreshTokenExpiresIn,
      );

      expect(result).toEqual({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    });
  });

  describe('refreshToken()', () => {
    it('should throw UnauthorizedException if JTI is invalid', async () => {
      mockRedisJtiProvider.isValidJti.mockResolvedValue(false);

      await expect(authService.refreshToken(refreshPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate new tokes if JTI is valid', async () => {
      mockRedisJtiProvider.isValidJti.mockResolvedValue(true);
      mockRedisJtiProvider.removeJti.mockResolvedValue(undefined);
      mockUserService.findUserById.mockResolvedValue(userEntity);

      mockJwtService.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await authService.refreshToken(refreshPayload);

      expect(mockRedisJtiProvider.isValidJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
      );

      expect(mockRedisJtiProvider.removeJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
      );

      expect(mockRedisJtiProvider.addJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
        AUTH_CONFIG.refreshTokenExpiresIn,
      );

      expect(result).toEqual({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    });
  });

  describe('logout()', () => {
    it('should remove JTI and return { logout: true }', async () => {
      mockRedisJtiProvider.removeJti.mockResolvedValue(undefined);

      const result = await authService.logout(refreshPayload);

      expect(mockRedisJtiProvider.removeJti).toHaveBeenCalledWith(
        userEntity.id.toString(),
        refreshPayload.jti,
      );

      expect(result).toEqual({ logout: true });
    });
  });
});
