// src/hashtag/hashtag.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { HashtagService } from './hashtag.service';
import { Hashtag } from './hashtag.entity';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

import {
  rawHashtagEntity,
  savedHashtagEntity,
  createHashtagDto,
  fakePaginatedHashtagsEntity,
  HASHTAG_ID,
  INVALID_HASHTAG_ID,
} from './__mocks__/hashtag.mock';

describe('HashtagService (unit)', () => {
  let hashtagService: HashtagService;

  // Mocks
  let hashtagRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
    softRemove: jest.Mock;
  };

  let paginationProvider: {
    paginateQuery: jest.Mock;
  };

  beforeEach(async () => {
    hashtagRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      softRemove: jest.fn(),
    };

    paginationProvider = {
      paginateQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashtagService,
        { provide: getRepositoryToken(Hashtag), useValue: hashtagRepo },
        { provide: PaginationProvider, useValue: paginationProvider },
      ],
    }).compile();

    hashtagService = module.get<HashtagService>(HashtagService);
    jest.clearAllMocks();
  });

  describe('getAllHashtags', () => {
    it('should paginate hashtags by PaginationProvider', async () => {
      const query: PaginationQueryDto = { limit: 1, page: 1 };
      paginationProvider.paginateQuery.mockResolvedValue(
        fakePaginatedHashtagsEntity,
      );

      const result = await hashtagService.getAllHashtags(query);

      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        query,
        hashtagRepo,
        { deletedAt: expect.any(Object) }, // IsNull()
        ['tweets'],
      );
      expect(result).toEqual(fakePaginatedHashtagsEntity);
    });
  });

  describe('createHashtag', () => {
    it('should create and save a hashtag', async () => {
      hashtagRepo.create.mockReturnValue(createHashtagDto);
      hashtagRepo.save.mockResolvedValue(savedHashtagEntity);

      const result = await hashtagService.createHashtag(createHashtagDto);

      expect(hashtagRepo.create).toHaveBeenCalledWith(createHashtagDto);
      expect(hashtagRepo.save).toHaveBeenCalledWith(createHashtagDto);
      expect(result).toEqual(savedHashtagEntity);
    });
  });

  describe('findHashtags', () => {
    it('should return hashtags when found', async () => {
      hashtagRepo.find.mockResolvedValue([rawHashtagEntity]);

      const result = await hashtagService.findHashtags([HASHTAG_ID[0]]);

      expect(hashtagRepo.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object), deletedAt: expect.any(Object) },
      });
      expect(result).toEqual([rawHashtagEntity]);
    });

    it('should throw NotFoundException when not found', async () => {
      hashtagRepo.find.mockResolvedValue(undefined);

      await expect(
        hashtagService.findHashtags([INVALID_HASHTAG_ID]),
      ).rejects.toThrow(NotFoundException);

      expect(hashtagRepo.find).toHaveBeenCalled();
    });
  });

  describe('deleteHashtag', () => {
    it('should delete a hashtag', async () => {
      hashtagRepo.findOne.mockResolvedValue(rawHashtagEntity);

      const result = await hashtagService.deleteHashtag(HASHTAG_ID[0]);

      expect(hashtagRepo.findOne).toHaveBeenCalledWith({
        where: { id: HASHTAG_ID[0] },
        relations: ['tweets'],
      });
      expect(hashtagRepo.remove).toHaveBeenCalledWith(rawHashtagEntity);
      expect(result).toEqual({ delete: 'true' });
    });

    it('should throw NotFoundException when not found', async () => {
      hashtagRepo.findOne.mockResolvedValue(undefined);

      await expect(
        hashtagService.deleteHashtag(INVALID_HASHTAG_ID),
      ).rejects.toThrow(NotFoundException);

      expect(hashtagRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteHashtag', () => {
    it('should soft delete a hashtag', async () => {
      hashtagRepo.findOne.mockResolvedValue(rawHashtagEntity);

      const result = await hashtagService.softDeleteHashtag(HASHTAG_ID[0]);

      expect(hashtagRepo.findOne).toHaveBeenCalledWith({
        where: { id: HASHTAG_ID[0] },
        relations: ['tweets'],
      });
      expect(hashtagRepo.softRemove).toHaveBeenCalledWith(rawHashtagEntity);
      expect(result).toEqual({ delete: 'true' });
    });

    it('should throw NotFoundException when not found', async () => {
      hashtagRepo.findOne.mockResolvedValue(undefined);

      await expect(
        hashtagService.softDeleteHashtag(INVALID_HASHTAG_ID),
      ).rejects.toThrow(NotFoundException);

      expect(hashtagRepo.softRemove).not.toHaveBeenCalled();
    });
  });
});
