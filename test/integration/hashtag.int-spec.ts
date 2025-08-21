import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashtagService } from '../../src/hashtag/hashtag.service';

import { HashtagModule } from '../../src/hashtag/hashtag.module';
import { PaginationModule } from '../../src/common/pagination/pagination.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/strategies/jwt-refresh.strategy';
import { PostgresTestModule } from './postgres-test.module';

import { Hashtag } from 'src/hashtag/hashtag.entity';

// Guard fake para evitar checagem de autenticação
class TestAuthGuard implements CanActivate {
  canActivate(_ctx: ExecutionContext) {
    return true;
  }
}

describe('HashtagModule – Integration', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let hashtagService: HashtagService;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PostgresTestModule,
        TypeOrmModule.forFeature([Hashtag]),
        HashtagModule,
        PaginationModule,
      ],
      providers: [
        HashtagService,
        {
          provide: APP_GUARD,
          useClass: TestAuthGuard,
        },
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue({})
      .overrideProvider(JwtRefreshStrategy)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // recria as tabelas a partir das suas entities
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    // fecha HTTP + DB
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    // garante que o event loop esvazie
    await new Promise((res) => setImmediate(res));
  });
  describe('createHashtag', () => {
    it('should create a hashtag successfully', async () => {
      const created = await hashtagService.createHashtag({ name: 'nestjs' });
      expect(created).toMatchObject({ name: 'nestjs' });
      expect(created).toHaveProperty('id');
      expect(typeof created.id).toBe('number');
      expect(typeof created.name).toBe('string');
    });
  });

  describe('getAllHashtags', () => {
    it('should list hashtags with pagination', async () => {
      await hashtagService.createHashtag({ name: 'a' });
      await hashtagService.createHashtag({ name: 'b' });
      await hashtagService.createHashtag({ name: 'c' });

      const page = await hashtagService.getAllHashtags({ limit: 2, page: 1 });
      expect(page.data.length).toBe(2);
      expect(page.meta.currentPage).toBe(1);
      expect(page.meta.itemsPerPage).toBe(2);
      expect(page.meta.totalItems).toBe(3);

      const page2 = await hashtagService.getAllHashtags({ limit: 2, page: 2 });
      expect(page2.data.length).toBe(1);
      expect(page2.meta.currentPage).toBe(2);
    });
  });

  describe('deleteHashtag', () => {
    it('should remove an existing hashtag permanently', async () => {
      const { id } = await hashtagService.createHashtag({ name: 'temp' });
      const res = await hashtagService.deleteHashtag(id);
      expect(res).toEqual({ delete: 'true' });

      await expect(hashtagService.deleteHashtag(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if id does not exist', async () => {
      await expect(hashtagService.deleteHashtag(9999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDeleteHashtag', () => {
    it('should soft-delete an existing hashtag', async () => {
      const { id } = await hashtagService.createHashtag({ name: 'soft' });
      const res = await hashtagService.softDeleteHashtag(id);
      expect(res).toEqual({ delete: 'true' });

      // não aparece mais na listagem normal
      const page = await hashtagService.getAllHashtags({ limit: 10, page: 1 });
      expect(page.data.find((h) => h.id === id)).toBeUndefined();
    });

    it('should throw NotFoundException if soft-delete id does not exist', async () => {
      await expect(hashtagService.softDeleteHashtag(8888)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
