// profile.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

import {
  INVALID_ID,
  rawProfile,
  savedProfile,
  createProfileDto,
  fakePaginatedProfiles,
} from './__mocks__/profile.mock';

describe('ProfileService (unit)', () => {
  let profileService: ProfileService;

  // Mocks
  let profileRepo: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  let paginationProvider: {
    paginateQuery: jest.Mock;
  };

  beforeEach(async () => {
    profileRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    paginationProvider = {
      paginateQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: profileRepo },
        { provide: PaginationProvider, useValue: paginationProvider },
      ],
    }).compile();

    profileService = module.get<ProfileService>(ProfileService);
    jest.clearAllMocks();
  });

  describe('getAllProfiles', () => {
    it('should paginate profiles by PaginationProvider', async () => {
      const query: PaginationQueryDto = { limit: 1, page: 1 };
      paginationProvider.paginateQuery.mockResolvedValue(fakePaginatedProfiles);

      const result = await profileService.getAllProfiles(query);

      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        query,
        profileRepo,
        undefined,
        ['user'],
      );
      expect(result).toEqual(fakePaginatedProfiles);
    });
  });

  describe('createProfile', () => {
    it('should create and save um profile', async () => {
      profileRepo.create.mockReturnValueOnce(rawProfile);
      profileRepo.save.mockResolvedValueOnce(savedProfile);

      const result = await profileService.createProfile(createProfileDto);

      expect(profileRepo.create).toHaveBeenCalledWith(createProfileDto);
      expect(profileRepo.save).toHaveBeenCalledWith(rawProfile);
      expect(result).toEqual(savedProfile);
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if does not exist', async () => {
      profileRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        profileService.updateProfile(123, createProfileDto),
      ).rejects.toThrow(new NotFoundException('This profile does not exist'));

      expect(profileRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 123 } },
        relations: ['user'],
      });
    });

    it('should update and save if exists', async () => {
      const existing = { ...rawProfile };
      profileRepo.findOne.mockResolvedValueOnce(existing);
      profileRepo.save.mockResolvedValueOnce(savedProfile);

      const result = await profileService.updateProfile(123, createProfileDto);

      expect(existing.firstName).toBe(createProfileDto.firstName);
      expect(profileRepo.save).toHaveBeenCalledWith(existing);
      expect(result).toEqual(savedProfile);
    });
  });

  describe('deleteProfile', () => {
    it('should throw NotFoundException if does not exist', async () => {
      profileRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(profileService.deleteProfile(INVALID_ID)).rejects.toThrow(
        new NotFoundException(
          `This profile with id ${INVALID_ID} does not exist`,
        ),
      );

      expect(profileRepo.delete).not.toHaveBeenCalled();
    });

    it('should delete if exist', async () => {
      profileRepo.findOneBy.mockResolvedValueOnce(rawProfile);
      profileRepo.delete.mockResolvedValueOnce({ affected: 1 } as any);

      const result = await profileService.deleteProfile(rawProfile.id);

      expect(profileRepo.delete).toHaveBeenCalledWith(rawProfile.id);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
