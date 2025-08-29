// test/e2e/auth.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

import { TestAppModule } from '../test-app.module';
import { RedisTestModule } from '../redis-test.module';

describe('Auth Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let redisClient: Redis;

  beforeAll(async () => {
    // 1) Redis de teste
    const redisMod = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();
    redisClient = redisMod.get<Redis>('REDIS_CLIENT');

    // 2) TestAppModule com override do REDIS_CLIENT
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue(redisClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // limpa Postgres e Redis antes de cada teste
    await dataSource.synchronize(true);
    await redisClient.flushdb();
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    redisClient.disconnect();
    await new Promise((res) => setImmediate(res));
  });

  describe('POST /auth/signup', () => {
    it('should register a new user and set a refresh-token cookie', async () => {
      const dto = {
        email: 'new@auth.com',
        username: 'newuser',
        password: 'Aa1!aaaa',
        profile: { firstName: 'Auth' },
      };

      const res = await request(httpServer)
        .post('/auth/signup')
        .send(dto)
        .expect(201);

      // body contains access token
      expect(res.body.token).toBeDefined();

      // refresh-token cookie set
      const cookies = res.headers['set-cookie'];
      expect(Array.isArray(cookies)).toBe(true);
      expect(cookies[0]).toMatch(/^refreshToken=/);
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user and set a refresh-token cookie', async () => {
      // primeiro cria via signup
      const signupRes = await request(httpServer)
        .post('/auth/signup')
        .send({
          email: 'login@auth.com',
          username: 'loginuser',
          password: 'Aa1!aaaa',
          profile: { firstName: 'Log' },
        })
        .expect(201);

      const loginDto = {
        username: 'loginuser',
        password: 'Aa1!aaaa',
      };

      const res = await request(httpServer)
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(res.body.token).toBeDefined();
      const cookies = res.headers['set-cookie'];
      expect(Array.isArray(cookies)).toBe(true);
      expect(cookies[0]).toMatch(/^refreshToken=/);
    });

    it('should return 404 with invalid credentials', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'noone', password: 'wrong' })
        .expect(404);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should renew tokens when refresh-token cookie is valid', async () => {
      // signup guarda refresh cookie
      const signupRes = await request(httpServer)
        .post('/auth/signup')
        .send({
          email: 'ref@auth.com',
          username: 'refuser',
          password: 'Aa1!aaaa',
          profile: { firstName: 'Ref' },
        })
        .expect(201);

      const cookie = signupRes.headers['set-cookie'];

      // chama refresh-token com o cookie
      const res = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', cookie)
        .expect(200);

      // novo access token
      expect(res.body.token).toBeDefined();

      // novo refresh cookie substitui o anterior
      const newCookies = res.headers['set-cookie'];
      expect(Array.isArray(newCookies)).toBe(true);
      expect(newCookies[0]).toMatch(/^refreshToken=/);
      expect(newCookies[0]).not.toEqual(cookie[0]);
    });

    it('should return 401 if refresh-token is missing or invalid', async () => {
      // sem cookie
      await request(httpServer).post('/auth/refresh-token').expect(401);

      // cookie aleatório
      await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', ['refreshToken=wrong;'])
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear the refresh-token cookie and return 204', async () => {
      const signupRes = await request(httpServer)
        .post('/auth/signup')
        .send({
          email: 'out@auth.com',
          username: 'outuser',
          password: 'Aa1!aaaa',
          profile: { firstName: 'Out' },
        })
        .expect(201);

      const accessToken = signupRes.body.token as string;
      const setCookiesHeader = signupRes.headers['set-cookie'] ?? [];
      const setCookies = Array.isArray(setCookiesHeader)
        ? setCookiesHeader
        : [setCookiesHeader];

      const logoutCookieHeader = setCookies
        .find((c) => c.includes('Path=/auth/logout'))!
        .split(';')[0]; // -> "refreshToken=XYZ…"

      const logoutRes = await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', logoutCookieHeader)
        .expect(204);

      const clearedHeader = logoutRes.headers['set-cookie'] ?? [];
      const clearedCookies = Array.isArray(clearedHeader)
        ? clearedHeader
        : [clearedHeader];

      const clearedNameValues = clearedCookies.map((c) => c.split(';')[0]);
      await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', clearedNameValues)
        .expect(401);
    });
  });
});
