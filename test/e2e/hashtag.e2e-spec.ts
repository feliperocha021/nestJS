// test/e2e/hashtag.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { TestAppModule } from '../test-app.module';
import { RedisTestModule } from '../redis-test.module';

import { Hashtag } from '../../src/hashtag/hashtag.entity';

describe('Hashtag Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let hashtagRepo: Repository<Hashtag>;
  let redisClient: Redis;
  let authToken: string;

  beforeAll(async () => {
    // Inicializa Redis de teste
    const redisMod = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();
    redisClient = redisMod.get<Redis>('REDIS_CLIENT');

    // Sobe o app com TestAppModule e sobrescreve REDIS_CLIENT
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
    hashtagRepo = moduleRef.get(getRepositoryToken(Hashtag));
  });

  beforeEach(async () => {
    // Limpa DB e Redis
    await dataSource.synchronize(true);
    await redisClient.flushdb();

    // Cria usuário e obtém token JWT
    const signup = await request(httpServer)
      .post('/auth/signup')
      .send({
        email: 'hashtag@e2e.com',
        username: 'hash_user',
        password: 'Aa1!aaaa',
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

  describe('GET /hashtags', () => {
    it('returns paginated list of hashtags', async () => {
      // insere duas hashtags manualmente
      await hashtagRepo.save({ name: 'tag1' });
      await hashtagRepo.save({ name: 'tag2' });

      const res = await request(httpServer)
        .get('/hashtags')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '5', page: '1' })
        .expect(200);

      const { data, meta, links } = res.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);

      // verifica campos de paginação
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

  describe('POST /hashtags', () => {
    it('creates a new hashtag', async () => {
      const dto = { name: 'newtag' };

      const res = await request(httpServer)
        .post('/hashtags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      const body = res.body;
      expect(body.id).toBeDefined();
      expect(body.name).toEqual(dto.name);
    });

    it('returns 400 on duplicate name', async () => {
      await hashtagRepo.save({ name: 'dup' });

      await request(httpServer)
        .post('/hashtags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'dup' })
        .expect(400);
    });
  });

  describe('DELETE /hashtags/:id', () => {
    it('deletes a hashtag permanently', async () => {
      const saved = await hashtagRepo.save({ name: 'todelete' });

      await request(httpServer)
        .delete(`/hashtags/${saved.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200, { delete: 'true' });

      // não deve mais listar
      const res = await request(httpServer)
        .get('/hashtags')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '5', page: '1' })
        .expect(200);

      expect(res.body.data.find((h: any) => h.id === saved.id)).toBeUndefined();
    });

    it('returns 404 when deleting non-existent hashtag', async () => {
      await request(httpServer)
        .delete('/hashtags/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /hashtags/soft-delete/:id', () => {
    it('soft-deletes a hashtag', async () => {
      const saved = await hashtagRepo.save({ name: 'softdel' });

      await request(httpServer)
        .delete(`/hashtags/soft-delete/${saved.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200, { delete: 'true' });

      // soft-deleted, não aparece na listagem
      const res = await request(httpServer)
        .get('/hashtags')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: '5', page: '1' })
        .expect(200);

      expect(res.body.data.find((h: any) => h.id === saved.id)).toBeUndefined();
    });

    it('returns 404 when soft-deleting non-existent hashtag', async () => {
      await request(httpServer)
        .delete('/hashtags/soft-delete/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
