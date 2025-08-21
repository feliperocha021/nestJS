import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TweetService } from '../../src/tweet/tweet.service';
import { HashtagService } from '../../src/hashtag/hashtag.service';
import { UserService } from '../../src/user/user.service';

import { TweetModule } from '../../src/tweet/tweet.module';
import { HashtagModule } from '../../src/hashtag/hashtag.module';
import { UserModule } from '../../src/user/user.module';
import { PaginationModule } from '../../src/common/pagination/pagination.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/strategies/jwt-refresh.strategy';
import { Redis } from 'ioredis';
import { PostgresTestModule } from './postgres-test.module';

import { Tweet } from 'src/tweet/tweet.entity';
import { User } from 'src/user/user.entity';
import { Hashtag } from 'src/hashtag/hashtag.entity';

// Guard fake para evitar checagem de autenticação
class TestAuthGuard implements CanActivate {
  canActivate(_ctx: ExecutionContext) {
    return true;
  }
}

describe('TweetModule – Integration', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let tweetService: TweetService;
  let userService: UserService;
  let hashtagService: HashtagService;
  let dataSource: DataSource;
  let redisClient: Redis;

  const validUser = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'Senha123!',
    profile: { bio: 'Bio da Alice' },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PostgresTestModule,
        TypeOrmModule.forFeature([Tweet, User, Hashtag]),
        TweetModule,
        HashtagModule,
        UserModule,
        PaginationModule,
      ],
      providers: [
        TweetService,
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
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        quit: async () => {},
      })
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

    tweetService = moduleRef.get<TweetService>(TweetService);
    userService = moduleRef.get<UserService>(UserService);
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    dataSource = moduleRef.get<DataSource>(DataSource);
    redisClient = moduleRef.get<Redis>('REDIS_CLIENT');
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

    // fecha socket do Redis
    await redisClient.quit();

    // garante que o event loop esvazie
    await new Promise((res) => setImmediate(res));
  });

  describe('createTweetOfUser & getTweetsByUser', () => {
    it('should create tweet with hashtags valid and paged', async () => {
      const user = await userService.createUser(validUser);

      const tag1 = await hashtagService.createHashtag({ name: 'nestjs' });
      const tag2 = await hashtagService.createHashtag({ name: 'testing' });

      const tweet = await tweetService.createTweetOfUser(user.id, {
        text: 'Hello world!',
        hashtags: [tag1.id, tag2.id],
      });

      expect(tweet.text).toBe('Hello world!');
      expect(tweet.hashtags?.map((h) => h.name).sort()).toEqual([
        'nestjs',
        'testing',
      ]);

      const page = await tweetService.getTweetsByUser(user.id, {
        limit: 10,
        page: 1,
      });

      expect(page.data.length).toBe(1);
      expect(page.meta.currentPage).toBe(1);
      expect(page.meta.totalItems).toBe(1);
    });

    it('should throw BadRequestException for invalid hashtags', async () => {
      const user = await userService.createUser(validUser);

      await expect(
        tweetService.createTweetOfUser(user.id, {
          text: 'Texto inválido',
          hashtags: [9999],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTweet', () => {
    it('should update text, image, and remove hashtags', async () => {
      const user = await userService.createUser(validUser);
      const tag = await hashtagService.createHashtag({ name: 'cool' });

      const original = await tweetService.createTweetOfUser(user.id, {
        text: 'antes',
        image: 'img.png',
        hashtags: [tag.id],
      });

      const updated = await tweetService.updateTweet(original.id, {
        text: 'depois',
        image: null,
        hashtags: [],
      });

      expect(updated.text).toBe('depois');
      expect(updated.image).toBe('img.png');
      expect(updated.hashtags).toEqual([]);
    });

    it('should throw NotFoundException if the tweet does not exist', async () => {
      await expect(
        tweetService.updateTweet(12345, { text: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTweet', () => {
    it('must delete tweet and ensure 404 after removal', async () => {
      const user = await userService.createUser(validUser);
      const tweet = await tweetService.createTweetOfUser(user.id, {
        text: 'deletar',
      });

      const res = await tweetService.deleteTweet(tweet.id);
      expect(res).toEqual({ delete: true });

      await expect(
        tweetService.updateTweet(tweet.id, { text: 'fail' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      await expect(tweetService.deleteTweet(54321)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
