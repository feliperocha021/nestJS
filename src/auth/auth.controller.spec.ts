import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import authConfig from './config/auth.config';

import {
  AUTH_CONFIG,
  loginDto,
  signupDto,
  tokens,
  refreshedTokens,
  refreshPayload,
} from './__mocks__/auth.mock';

import * as cookieHandlers from './utils/handler-cookies';
jest.mock('./utils/handler-cookies');

describe('AuthController (unit)', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signup: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
        {
          provide: authConfig.KEY,
          useValue: AUTH_CONFIG,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login()', () => {
    it('should call AuthService.login, set refresh cookie and return token', async () => {
      authService.login.mockResolvedValue({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      const res = { cookie: jest.fn() } as unknown as Response;
      const result = await authController.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(cookieHandlers.setRefreshTokenCookie).toHaveBeenCalledWith(
        res,
        tokens.refreshToken,
      );
      expect(result).toEqual({ token: tokens.accessToken });
    });
  });

  describe('signup()', () => {
    it('should call AuthService.signup, set refresh cookie and return token', async () => {
      authService.signup.mockResolvedValue({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      const res = { cookie: jest.fn() } as unknown as Response;
      const result = await authController.signup(signupDto, res);

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(cookieHandlers.setRefreshTokenCookie).toHaveBeenCalledWith(
        res,
        tokens.refreshToken,
      );
      expect(result).toEqual({ token: tokens.accessToken });
    });
  });

  describe('logout()', () => {
    it('should call AuthService.logout, clear cookies and return logout true', async () => {
      authService.logout.mockResolvedValue({ logout: true });

      const res = { clearCookie: jest.fn() } as unknown as Response;
      const req = { user: refreshPayload } as unknown as Request & {
        user: typeof refreshPayload;
      };

      const result = await authController.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith(refreshPayload);
      expect(cookieHandlers.clearRefreshTokenCookies).toHaveBeenCalledWith(res);
      expect(result).toEqual({ logout: true });
    });
  });

  describe('refreshToken()', () => {
    it('should call AuthService.refreshToken, set refresh cookie and return token', async () => {
      authService.refreshToken.mockResolvedValue({
        token: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
      });

      const res = { cookie: jest.fn() } as unknown as Response;
      const req = { user: refreshPayload } as unknown as Request & {
        user: typeof refreshPayload;
      };

      // limpar chamadas anteriores
      jest.clearAllMocks();

      const result = await authController.refreshToken(req, res);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshPayload);
      expect(cookieHandlers.setRefreshTokenCookie).toHaveBeenCalledWith(
        res,
        refreshedTokens.refreshToken,
      );
      expect(result).toEqual({ token: refreshedTokens.accessToken });
    });
  });
});
