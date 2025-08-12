// tweet.service.spec.ts (ajustado)
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { TweetService } from './tweet.service';
import { Tweet } from './tweet.entity';
import { UserService } from 'src/user/user.service';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

import {
  // ENTIDADE (service)
  rawTweetEntity,
  rawTweetEntityNoHashtags,
  savedTweetEntity,
  fakePaginatedTweetsEntity,

  // ARGUMENTOS (entrada do service)
  createTweetDto,
  updateTweetDto,

  // IDs e auxiliares
  TWEET_ID,
  INVALID_TWEET_ID,

  // Hashtag utilizada nas chamadas
  rawHashtag,
} from './__mocks__/tweet.mock';
import { CreateTweetDto } from './dto/create-tweet.dto';

describe('TweetService (unit)', () => {
  let tweetService: TweetService;

  // Mocks
  let tweetRepo: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  let userService: {
    findUserById: jest.Mock;
  };

  let hashtagService: {
    findHashtags: jest.Mock;
  };

  let paginationProvider: {
    paginateQuery: jest.Mock;
  };

  beforeEach(async () => {
    tweetRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    userService = {
      findUserById: jest.fn(),
    };

    hashtagService = {
      findHashtags: jest.fn(),
    };

    paginationProvider = {
      paginateQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetService,
        { provide: getRepositoryToken(Tweet), useValue: tweetRepo },
        { provide: UserService, useValue: userService },
        { provide: HashtagService, useValue: hashtagService },
        { provide: PaginationProvider, useValue: paginationProvider },
      ],
    }).compile();

    tweetService = module.get<TweetService>(TweetService);
    jest.clearAllMocks();
  });

  describe('getTweetsByUser', () => {
    it('should return paginated tweets (entity format)', async () => {
      const query: PaginationQueryDto = { limit: 1, page: 1 };
      userService.findUserById.mockResolvedValue(undefined);
      paginationProvider.paginateQuery.mockResolvedValue(fakePaginatedTweetsEntity);

      const result = await tweetService.getTweetsByUser(1, query);

      expect(userService.findUserById).toHaveBeenCalledWith(1);
      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        query,
        tweetRepo,
        { user: { id: 1 } },
      );
      expect(result).toEqual(fakePaginatedTweetsEntity);
    });
  });

  describe('createTweetOfUser', () => {
    it('should create a tweet with hashtags (entity format)', async () => {
      userService.findUserById.mockResolvedValue({ id: 1, username: 'mark' });
      hashtagService.findHashtags.mockResolvedValue([rawHashtag]);
      tweetRepo.create.mockImplementation((data: CreateTweetDto) => data as any);
      tweetRepo.save.mockResolvedValue(savedTweetEntity as any);

      const dto = { ...createTweetDto, hashtags: [rawHashtag.id] };
      const result = await tweetService.createTweetOfUser(1, dto);

      expect(userService.findUserById).toHaveBeenCalledWith(1);
      expect(hashtagService.findHashtags).toHaveBeenCalledWith([rawHashtag.id]);
      expect(tweetRepo.create).toHaveBeenCalled();
      expect(tweetRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedTweetEntity);
    });

    it('should throw BadRequestException when hashtags are invalid', async () => {
      userService.findUserById.mockResolvedValue({ id: 1, username: 'mark' });
      hashtagService.findHashtags.mockResolvedValue([]); // não encontrou nenhuma

      const dto = { ...createTweetDto, hashtags: [999] };
      await expect(tweetService.createTweetOfUser(1, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(tweetRepo.create).not.toHaveBeenCalled();
      expect(tweetRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateTweet', () => {
    it('should update a tweet (entity format)', async () => {
      tweetRepo.findOneBy.mockResolvedValue(rawTweetEntity);
      hashtagService.findHashtags.mockResolvedValue([rawHashtag]);
      tweetRepo.save.mockResolvedValue(savedTweetEntity);

      const dto = { ...updateTweetDto, hashtags: [rawHashtag.id] };
      const result = await tweetService.updateTweet(TWEET_ID[0], dto);

      expect(tweetRepo.findOneBy).toHaveBeenCalledWith({ id: TWEET_ID[0] });
      expect(hashtagService.findHashtags).toHaveBeenCalledWith([rawHashtag.id]);
      expect(tweetRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedTweetEntity);
    });

    it('should throw NotFoundException when tweet not found', async () => {
      tweetRepo.findOneBy.mockResolvedValue(undefined);

      await expect(
        tweetService.updateTweet(INVALID_TWEET_ID, updateTweetDto),
      ).rejects.toThrow(NotFoundException);

      expect(hashtagService.findHashtags).not.toHaveBeenCalled();
      expect(tweetRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when hashtags are invalid', async () => {
      tweetRepo.findOneBy.mockResolvedValue(rawTweetEntity);
      hashtagService.findHashtags.mockResolvedValue([]); // vazio

      const dto = { ...updateTweetDto, hashtags: [999] };
      await expect(tweetService.updateTweet(TWEET_ID[0], dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(tweetRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteTweet', () => {
    it('should delete tweet (entity format)', async () => {
      tweetRepo.findOne.mockResolvedValue(rawTweetEntity);
      tweetRepo.remove.mockResolvedValue(rawTweetEntity);

      const result = await tweetService.deleteTweet(TWEET_ID[0]);

      expect(tweetRepo.findOne).toHaveBeenCalledWith({
        where: { id: TWEET_ID[0] },
        relations: ['hashtags'],
      });
      expect(tweetRepo.remove).toHaveBeenCalledWith(rawTweetEntity);
      expect(result).toEqual(rawTweetEntity);
    });

    it('should throw NotFoundException when tweet not found', async () => {
      tweetRepo.findOne.mockResolvedValue(undefined);

      await expect(tweetService.deleteTweet(INVALID_TWEET_ID)).rejects.toThrow(
        NotFoundException,
      );

      expect(tweetRepo.remove).not.toHaveBeenCalled();
    });
  });
});
