import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Redis from 'ioredis';

import { TestAppModule } from '../test-app.module';
import { RedisTestModule } from '../redis-test.module';

import { User } from '../../src/user/user.entity';
import { Profile } from '../../src/profile/profile.entity';

describe('User Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let userRepo: Repository<User>;
  let profileRepo: Repository<Profile>;
  let redisClient: Redis;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const redisMod: TestingModule = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();
    redisClient = redisMod.get<Redis>('REDIS_CLIENT');

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue(redisClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = moduleRef.get<DataSource>(DataSource);
    userRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    profileRepo = moduleRef.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  beforeEach(async () => {
    // recria as tabelas a partir das suas entities
    await dataSource.synchronize(true);

    // limpa todos os JTIs no Redis
    await redisClient.flushdb();

    // recria o user + JWT após o reset
    const signupRes = await request(httpServer)
      .post('/auth/signup')
      .send({
        email: 'e2e@example.com',
        username: 'e2e_user',
        password: 'Aa1!aaaa',
        profile: {
          firstName: 'e2e',
        },
      })
      .expect(201);
    authToken = signupRes.body.token;
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    redisClient.disconnect();
    await new Promise((res) => setImmediate(res));
  });

  describe('POST /users', () => {
    it('should create a new user with empty profile', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'tester',
        password: 'Aa1!aaaa',
      };

      const res = await request(httpServer)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201);

      const body = res.body as any;
      expect(body.id).toBeDefined();
      expect(body.email).toEqual(createUserDto.email);
      expect(body.username).toEqual(createUserDto.username);
      expect(body.createdAt).toBeDefined();
      expect(body).toHaveProperty('profile');
    });
  });

  describe('GET /users', () => {
    it('should return paginated list including our user', async () => {
      const u = userRepo.create({
        email: 'a@b.com',
        username: 'foo',
        password: 'hashed',
      });
      const saved = await userRepo.save(u);
      // create profile manually (service would do this in real app)
      await profileRepo.save({ user: saved });

      // now request list
      const res = await request(httpServer)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '5', page: '1' })
        .expect(200);

      const { data, meta, links } = res.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[1].id).toEqual(saved.id);
      expect(meta).toMatchObject({
        totalItems: 2,
        itemsPerPage: 5,
        currentPage: 1,
        totalPages: 1,
      });
      expect(links.first).toContain('page=1');
      expect(links.last).toContain('page=1');
      expect(links.current).toContain('page=1');
    });
  });

  describe('GET /users/me', () => {
    it('should return details of the authenticated user', async () => {
      const res = await request(httpServer)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = res.body;
      expect(body).toHaveProperty('id');
      expect(body.username).toEqual('e2e_user');
      expect(body.email).toEqual('e2e@example.com');
    });
  });

  describe('DELETE /users/me', () => {
    it('should delete user and its profile', async () => {
      const res = await request(httpServer)
        .delete('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toEqual({ delete: true });

      // now trying to fetch gives 404
      await request(httpServer)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
