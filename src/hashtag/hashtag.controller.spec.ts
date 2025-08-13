import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { NotFoundException } from '@nestjs/common';

import { HashtagController } from './hashtag.controller';
import { HashtagService } from './hashtag.service';
import { HashtagResponseDto } from './dto/hashtag-response.dto';
import {
  fakePaginatedHashtagsEntity,
  rawHashtagDto,
  savedHashtagEntity,
  savedHashtagDto,
  createHashtagDto,
  HASHTAG_ID,
  INVALID_HASHTAG_ID,
} from './__mocks__/hashtag.mock';

describe('HashtagController (unit)', () => {
  let hashtagController: HashtagController;
  let hashtagService: jest.Mocked<HashtagService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HashtagController],
      providers: [
        {
          provide: HashtagService,
          useValue: {
            getAllHashtags: jest.fn(),
            createHashtag: jest.fn(),
            deleteHashtag: jest.fn(),
            softDeleteHashtag: jest.fn(),
          },
        },
      ],
    }).compile();

    hashtagController = module.get<HashtagController>(HashtagController);
    hashtagService = module.get<jest.Mocked<HashtagService>>(HashtagService);
  });

  it('should be defined', () => {
    expect(hashtagController).toBeDefined();
  });

  describe('getAllHashtags', () => {
    it('should fetch paginated hashtags and return DTOs with links', async () => {
      // mocka retorno cru do service
      hashtagService.getAllHashtags.mockResolvedValue(
        fakePaginatedHashtagsEntity,
      );

      const query = { limit: 1, page: 1 };
      const req = {
        protocol: 'http',
        headers: { host: 'localhost:3000' },
        baseUrl: '/hashtags',
        path: '',
      } as unknown as Request;

      const result = await hashtagController.getAllHashtags(req, query);

      expect(hashtagService.getAllHashtags).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      // após transformação, é DTO
      expect(result.data[0]).toBeInstanceOf(HashtagResponseDto);
      expect(result.data[0]).toEqual({
        id: rawHashtagDto.id,
        name: rawHashtagDto.name,
        tweets: rawHashtagDto.tweets,
      });
      expect(result.meta).toEqual(fakePaginatedHashtagsEntity.meta);
      expect(result.links).toEqual({
        first: 'http://localhost:3000/hashtags?limit=1&page=1',
        last: 'http://localhost:3000/hashtags?limit=1&page=2',
        current: 'http://localhost:3000/hashtags?limit=1&page=1',
        next: 'http://localhost:3000/hashtags?limit=1&page=2',
        previous: 'http://localhost:3000/hashtags?limit=1&page=1',
      });
    });
  });

  describe('createHashtag', () => {
    it('should create a hashtag and return a DTO', async () => {
      // service retorna entidade crua
      hashtagService.createHashtag.mockResolvedValue(savedHashtagEntity as any);

      const result = await hashtagController.createHashtag(createHashtagDto);

      expect(hashtagService.createHashtag).toHaveBeenCalledWith(
        createHashtagDto,
      );
      expect(result).toBeInstanceOf(HashtagResponseDto);
      expect(result).toEqual({
        id: savedHashtagDto.id,
        name: savedHashtagDto.name,
        tweets: undefined,
      });
    });
  });

  describe('deleteHashtag', () => {
    it('should return delete=true', async () => {
      const fakeResponse = { delete: 'true' };
      hashtagService.deleteHashtag.mockResolvedValue(fakeResponse);

      const result = await hashtagController.deleteHashtag(HASHTAG_ID[0]);

      expect(hashtagService.deleteHashtag).toHaveBeenCalledWith(HASHTAG_ID[0]);
      expect(result).toEqual(fakeResponse);
    });

    it('should propagate NotFoundException when hashtag not found', async () => {
      hashtagService.deleteHashtag.mockRejectedValue(
        new NotFoundException(
          `Hashtag with id ${INVALID_HASHTAG_ID} not found`,
        ),
      );

      await expect(
        hashtagController.deleteHashtag(INVALID_HASHTAG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteHashtag', () => {
    it('should return delete=true', async () => {
      const fakeResponse = { delete: 'true' };
      hashtagService.softDeleteHashtag.mockResolvedValue(fakeResponse);

      const result = await hashtagController.softDeleteHashtag(HASHTAG_ID[0]);

      expect(hashtagService.softDeleteHashtag).toHaveBeenCalledWith(
        HASHTAG_ID[0],
      );
      expect(result).toEqual(fakeResponse);
    });

    it('should propagate NotFoundException when hashtag not found', async () => {
      hashtagService.softDeleteHashtag.mockRejectedValue(
        new NotFoundException(
          `Hashtag with id ${INVALID_HASHTAG_ID} not found`,
        ),
      );

      await expect(
        hashtagController.softDeleteHashtag(INVALID_HASHTAG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
