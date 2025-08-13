// src/tweet/tweet.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { NotFoundException } from '@nestjs/common';

import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';
import { TweetResponseDto } from './dto/tweet-response.dto';
import {
  TWEET_ID,
  INVALID_TWEET_ID,
  fakePaginatedTweetsDto,
  fakePaginatedTweetsEntity,
  savedTweetEntity,
  createTweetDto,
  updateTweetDto,
  savedTweetDto,
} from './__mocks__/tweet.mock';

describe('TweetController (unit)', () => {
  let tweetController: TweetController;
  let tweetService: jest.Mocked<TweetService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetController],
      providers: [
        {
          provide: TweetService,
          useValue: {
            getTweetsByUser: jest.fn(),
            createTweetOfUser: jest.fn(),
            updateTweet: jest.fn(),
            deleteTweet: jest.fn(),
          },
        },
      ],
    }).compile();

    tweetController = module.get<TweetController>(TweetController);
    tweetService = module.get<jest.Mocked<TweetService>>(TweetService);
  });

  it('should be defined', () => {
    expect(tweetController).toBeDefined();
  });

  describe('getTweetsByUser', () => {
    it('should fetch paginated tweets and return DTOs with links', async () => {
      tweetService.getTweetsByUser.mockResolvedValue(fakePaginatedTweetsEntity);

      const query = { limit: 1, page: 1 };
      const req = {
        protocol: 'http',
        headers: { host: 'localhost:3000' },
        baseUrl: '/tweets',
        path: '',
      } as Request;

      const result = await tweetController.getTweetsByUser(req, 1, query);

      expect(tweetService.getTweetsByUser).toHaveBeenCalledWith(1, query);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TweetResponseDto);
      expect(result.data[0]).toEqual(fakePaginatedTweetsDto.data[0]);
      expect(result.meta).toEqual(fakePaginatedTweetsDto.meta);
      expect(result.links).toEqual(fakePaginatedTweetsDto.links);
    });
  });

  describe('createTweetOfUser', () => {
    it('should create tweet and return DTO', async () => {
      tweetService.createTweetOfUser.mockResolvedValue(savedTweetEntity);

      const result = await tweetController.createTweetOfUser(createTweetDto, 1);

      expect(tweetService.createTweetOfUser).toHaveBeenCalledWith(
        1,
        createTweetDto,
      );
      expect(result).toBeInstanceOf(TweetResponseDto);
      expect(result).toEqual(savedTweetDto);
    });
  });

  describe('updateTweet', () => {
    it('should update tweet and return DTO', async () => {
      tweetService.updateTweet.mockResolvedValue(savedTweetEntity);

      const result = await tweetController.updateTweet(
        updateTweetDto,
        TWEET_ID[1],
      );

      expect(tweetService.updateTweet).toHaveBeenCalledWith(
        TWEET_ID[1],
        updateTweetDto,
      );
      expect(result).toBeInstanceOf(TweetResponseDto);
      expect(result).toEqual(savedTweetDto);
    });

    it('should propagate NotFoundException when tweet not found', async () => {
      tweetService.updateTweet.mockRejectedValue(
        new NotFoundException(
          `Tweet with id ${INVALID_TWEET_ID} does not exist`,
        ),
      );

      await expect(
        tweetController.updateTweet(updateTweetDto, INVALID_TWEET_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTweet', () => {
    it('should delete tweet', async () => {
      const fakeDeleteResult = { delete: true };
      tweetService.deleteTweet.mockResolvedValue(fakeDeleteResult);

      const result = await tweetController.deleteTweet(TWEET_ID[0]);

      expect(tweetService.deleteTweet).toHaveBeenCalledWith(TWEET_ID[0]);
      expect(result).toEqual(fakeDeleteResult);
    });

    it('should propagate NotFoundException when tweet not found', async () => {
      tweetService.deleteTweet.mockRejectedValue(
        new NotFoundException(
          `Tweet with id ${INVALID_TWEET_ID} does not exist`,
        ),
      );

      await expect(
        tweetController.deleteTweet(INVALID_TWEET_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
