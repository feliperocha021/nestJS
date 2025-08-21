import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/user/user.service';
import { RedisJtiProvider } from '../../src/auth/provider/redis-jti.provider';
import { CreateUserDto } from '../../src/user/dtos/create-user.dto';

import { PostgresTestModule } from './postgres-test.module';
import { RedisTestModule } from './redis-test.module';
import { AuthModule } from '../../src/auth/auth.module';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../../src/auth/strategies/jwt-refresh.strategy';

describe('AuthService – Integration', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let redisJti: RedisJtiProvider;
  let jwtService: JwtService;
  let db: DataSource;
  let redisClient: Redis;

  const validUser: CreateUserDto = {
    username: 'felipe',
    email: 'felipe@example.com',
    password: 'Senha123!',
    profile: { bio: 'Minha bio' },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // carrega .env de teste
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test.local',
        }),

        // modules de infra para DB e Redis
        PostgresTestModule,
        RedisTestModule,

        // importa AuthModule completo (ele já traz UserModule, TypeOrm, JwtModule etc)
        AuthModule,
      ],
    })
      // mocka as strategies para pular guards
      .overrideProvider(JwtStrategy)
      .useValue({})
      .overrideProvider(JwtRefreshStrategy)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
    redisJti = moduleRef.get(RedisJtiProvider);
    jwtService = moduleRef.get(JwtService);
    db = moduleRef.get(DataSource);
    redisClient = moduleRef.get<Redis>('REDIS_CLIENT');
    if (redisClient.status !== 'ready') {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    await app.close();
    if (db.isInitialized) {
      await db.destroy();
    }
    await redisClient.quit();
    await new Promise((res) => setImmediate(res));
  });

  beforeEach(async () => {
    // recria as tabelas a partir das suas entities
    await db.synchronize(true);

    // limpa todos os JTIs no Redis
    await redisClient.flushdb();
  });

  describe('signup()', () => {
    it('should create a user, return tokens and store JTI in Redis', async () => {
      const { token, refreshToken } = await authService.signup(validUser);

      // decodifica payload de acesso
      const accessPayload = jwtService.decode(token);
      expect(accessPayload.username).toBe(validUser.username);

      // decodifica payload de refresh
      const refreshPayload = jwtService.decode(refreshToken);
      expect(refreshPayload.sub).toBe(accessPayload.sub);

      // JTI deve estar válido no Redis
      const isValid = await redisJti.isValidJti(
        refreshPayload.sub.toString(),
        refreshPayload.jti,
      );
      expect(isValid).toBe(true);
    });
  });

  describe('login()', () => {
    beforeEach(async () => {
      // cadastra o user via service
      await userService.createUser(validUser);
    });

    it('should return tokens and store JTI in Redis when credentials are correct', async () => {
      const { token, refreshToken } = await authService.login({
        username: validUser.username,
        password: validUser.password,
      });

      const payload = jwtService.decode(refreshToken);
      const isValid = await redisJti.isValidJti(
        payload.sub.toString(),
        payload.jti,
      );
      expect(isValid).toBe(true);
    });

    it('should throw if password is wrong', async () => {
      await expect(
        authService.login({
          username: validUser.username,
          password: 'badpass',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken()', () => {
    let sub: number;
    let oldJti: string;

    beforeEach(async () => {
      const { refreshToken } = await authService.signup(validUser);
      const decoded = jwtService.decode(refreshToken);
      sub = decoded.sub;
      oldJti = decoded.jti;
    });

    it('should revoke old JTI, return new tokens and store new JTI', async () => {
      const { token, refreshToken } = await authService.refreshToken({
        sub,
        jti: oldJti,
      });

      // antigo JTI deve estar inválido
      const wasValid = await redisJti.isValidJti(sub.toString(), oldJti);
      expect(wasValid).toBe(false);

      // novo JTI deve ser válido
      const newJti = (jwtService.decode(refreshToken) as { jti: string }).jti;
      const isValid = await redisJti.isValidJti(sub.toString(), newJti);
      expect(isValid).toBe(true);

      // novo access token deve conter sub
      const accessSub = (jwtService.decode(token) as { sub: number }).sub;
      expect(accessSub).toBe(sub);
    });

    it('should throw if JTI is not found or already revoked', async () => {
      await expect(
        authService.refreshToken({ sub, jti: 'non-existent-jti' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout()', () => {
    let sub: number;
    let jti: string;

    beforeEach(async () => {
      const { refreshToken } = await authService.signup(validUser);
      const decoded = jwtService.decode(refreshToken);
      sub = decoded.sub;
      jti = decoded.jti;
    });

    it('should remove JTI from Redis', async () => {
      // garante que está salvo
      let valid = await redisJti.isValidJti(sub.toString(), jti);
      expect(valid).toBe(true);

      // chama logout
      await authService.logout({ sub, jti });

      // agora deve estar removido
      valid = await redisJti.isValidJti(sub.toString(), jti);
      expect(valid).toBe(false);
    });
  });
});
