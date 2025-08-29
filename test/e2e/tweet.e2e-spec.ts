// test/e2e/tweet.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { TestAppModule } from '../test-app.module';
import { RedisTestModule } from '../redis-test.module';

import { User } from '../../src/user/user.entity';
import { Tweet } from '../../src/tweet/tweet.entity';
import { Hashtag } from '../../src/hashtag/hashtag.entity';

describe('Tweet Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let userRepo: Repository<User>;
  let tweetRepo: Repository<Tweet>;
  let hashtagRepo: Repository<Hashtag>;
  let redisClient: Redis;

  let authToken: string;
  let authUserId: number;

  beforeAll(async () => {
    // 1) Redis de teste
    const redisMod = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();
    redisClient = redisMod.get<Redis>('REDIS_CLIENT');

    // 2) App de teste com override do REDIS_CLIENT
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
    tweetRepo = moduleRef.get(getRepositoryToken(Tweet));
    hashtagRepo = moduleRef.get(getRepositoryToken(Hashtag));
  });

  beforeEach(async () => {
    // limpa Postgres e Redis
    await dataSource.synchronize(true);
    await redisClient.flushdb();

    // signup e captura token + userId
    const signup = await request(httpServer)
      .post('/auth/signup')
      .send({
        email: 'tweet@test.com',
        username: 'tweet_user',
        password: 'Aa1!aaaa',
      })
      .expect(201);

    authToken = signup.body.token;
    const meRes = await request(httpServer)
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    authUserId = meRes.body.id;
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    redisClient.disconnect();
    await new Promise((res) => setImmediate(res));
  });

  describe('POST /tweets', () => {
    it('creates a tweet without hashtags', async () => {
      const dto = { text: 'Hello world', image: null, hashtags: [] };

      const res = await request(httpServer)
        .post('/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      const tweet = res.body;
      expect(tweet.id).toBeDefined();
      expect(tweet.text).toEqual(dto.text);
      expect(tweet.image).toBeNull();
      expect(tweet.user.id).toEqual(authUserId);
      expect(Array.isArray(tweet.hashtags)).toBe(true);
      expect(tweet.hashtags).toHaveLength(0);
    });

    it('creates a tweet with existing hashtags', async () => {
      // preparar duas hashtags
      const h1 = await hashtagRepo.save({ name: 'one' });
      const h2 = await hashtagRepo.save({ name: 'two' });

      const dto = { text: 'With tags', hashtags: [h1.id, h2.id] };

      const res = await request(httpServer)
        .post('/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      const tweet = res.body;
      const ids = tweet.hashtags.map((h: any) => h.id).sort();
      expect(ids).toEqual([h1.id, h2.id].sort());
    });

    it('returns 400 if hashtags array mismatches existing records', async () => {
      const h = await hashtagRepo.save({ name: 'only' });
      const dto = { text: 'Bad tags', hashtags: [h.id, 9999] };

      await request(httpServer)
        .post('/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(400);
    });
  });

  describe('GET /tweets', () => {
    it('returns paginated tweets for the authenticated user', async () => {
      // criar dois tweets direto no repositório
      const user = await userRepo.findOneByOrFail({ id: authUserId });
      await tweetRepo.save(tweetRepo.create({ text: 't1', user }));
      await tweetRepo.save(tweetRepo.create({ text: 't2', user }));

      const res = await request(httpServer)
        .get('/tweets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '10', page: '1' })
        .expect(200);

      const { data, meta, links } = res.body;
      expect(data).toHaveLength(2);
      expect(meta.itemsPerPage).toBe(10);
      expect(meta.currentPage).toBe(1);
      expect(links.first).toContain('page=1');
    });
  });

  describe('PATCH /tweets/:id', () => {
    it('updates text and image of an existing tweet', async () => {
      const user = await userRepo.findOneByOrFail({ id: authUserId });
      const tweet = await tweetRepo.save(
        tweetRepo.create({ text: 'old', user }),
      );

      const dto = { text: 'new text', image: 'http://img', hashtags: [] };
      const res = await request(httpServer)
        .patch(`/tweets/${tweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(200);

      expect(res.body.text).toEqual(dto.text);
      expect(res.body.image).toEqual(dto.image);
    });

    it('returns 404 when updating a non-existent tweet', async () => {
      await request(httpServer)
        .patch('/tweets/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /tweets/:id', () => {
    it('deletes an existing tweet', async () => {
      const user = await userRepo.findOneByOrFail({ id: authUserId });
      const tweet = await tweetRepo.save(
        tweetRepo.create({ text: 'to delete', user }),
      );

      await request(httpServer)
        .delete(`/tweets/${tweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200, { delete: true });

      // segunda remoção deve 404
      await request(httpServer)
        .delete(`/tweets/${tweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
