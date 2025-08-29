// test/e2e/profile.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { TestAppModule } from '../test-app.module';
import { RedisTestModule } from '../redis-test.module';

import { User } from '../../src/user/user.entity';
import { Profile, Gender } from '../../src/profile/profile.entity';

describe('Profile Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let userRepo: Repository<User>;
  let profileRepo: Repository<Profile>;
  let redisClient: Redis;
  let authToken: string;

  beforeAll(async () => {
    const redisMod = await Test.createTestingModule({
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = moduleRef.get<DataSource>(DataSource);
    userRepo = moduleRef.get(getRepositoryToken(User));
    profileRepo = moduleRef.get(getRepositoryToken(Profile));
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
    await redisClient.flushdb();

    const signup = await request(httpServer)
      .post('/auth/signup')
      .send({
        email: 'e2e@profile.com',
        username: 'profile_user',
        password: 'Aa1!aaaa',
        profile: { firstName: 'Initial', bio: 'hello profile' },
      })
      .expect(201);

    authToken = signup.body.token;
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    redisClient.disconnect();
    await new Promise((res) => setImmediate(res));
  });

  describe('GET /profiles', () => {
    it('should return paginated list with the signed-up profile', async () => {
      const u2 = userRepo.create({
        email: 'other@profile.com',
        username: 'other_user',
        password: 'hashed',
      });
      const saved2 = await userRepo.save(u2);
      await profileRepo.save({
        user: saved2,
        firstName: 'Second',
        lastName: 'User',
      });

      const res = await request(httpServer)
        .get('/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '5', page: '1' })
        .expect(200);

      const { data, meta, links } = res.body;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);

      const first = data.find((p: any) => p.user.username === 'profile_user');
      expect(first).toBeDefined();
      expect(first.firstName).toEqual('Initial');
      expect(first.bio).toEqual('hello profile');

      expect(meta).toMatchObject({
        totalItems: 2,
        itemsPerPage: 5,
        currentPage: 1,
        totalPages: 1,
      });

      expect(links.first).toContain('page=1');
      expect(links.current).toContain('page=1');
    });
  });

  describe('PATCH /profiles/me', () => {
    it('should update the authenticated user‘s profile', async () => {
      const updateDto = {
        firstName: 'UpdatedName',
        lastName: 'Surname',
        gender: Gender.MALE,
        bio: 'Updated bio text',
        dateOfBirth: '1995-12-31',
      };

      const res = await request(httpServer)
        .patch('/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      const body = res.body;

      expect(body.id).toBeDefined();
      expect(body.firstName).toEqual(updateDto.firstName);
      expect(body.lastName).toEqual(updateDto.lastName);
      expect(body.gender).toEqual(updateDto.gender);
      expect(body.bio).toEqual(updateDto.bio);

      expect(new Date(body.dateOfBirth).toISOString()).toContain('1995-12-31');

      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('username', 'profile_user');
    });
  });
});
