import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { NotFoundException } from '@nestjs/common';
import {
  USER_ID,
  PROFILE_ID,
  INVALID_ID,
  rawProfile,
  fakePaginatedProfiles,
  savedProfile,
  createProfileDto,
} from './__mocks__/profile.mock';

describe('ProfileController (unit)', () => {
  let profileController: ProfileController;
  let profileService: jest.Mocked<ProfileService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getAllProfiles: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
    profileService = module.get<jest.Mocked<ProfileService>>(ProfileService);
  });

  it('should be defined', () => {
    expect(profileController).toBeDefined();
  });

  describe('getAllProfiles', () => {
    it('should fetch paginated profiles and return DTOs', async () => {
      profileService.getAllProfiles.mockResolvedValue(fakePaginatedProfiles);

      const query = { limit: 1, page: 1 };
      const result = await profileController.getAllProfiles(query);

      expect(profileService.getAllProfiles).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ProfileResponseDto);
      expect(result.data[0]).toEqual({
        id: PROFILE_ID[0],
        firstName: 'Mark',
        lastName: 'Will',
        gender: rawProfile.gender,
        dateOfBirth: rawProfile.dateOfBirth,
        bio: 'Just a test profile',
        profileImage: 'https://example.com/avatar.png',
        user: {
          id: USER_ID[0],
          username: 'Mark',
        },
      });
      expect(result.meta).toEqual(fakePaginatedProfiles.meta);
      expect(result.links).toEqual(fakePaginatedProfiles.links);
    });
  });

  describe('updateProfileUser', () => {
    it('should update and return a ProfileResponseDto', async () => {
      profileService.updateProfile.mockResolvedValue(savedProfile);

      const result = await profileController.updateProfileUser(
        createProfileDto,
        USER_ID[1],
      );

      expect(profileService.updateProfile).toHaveBeenCalledWith(
        USER_ID[1],
        createProfileDto,
      );
      expect(result).toBeInstanceOf(ProfileResponseDto);
      expect(result).toEqual({
        id: savedProfile.id,
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        gender: savedProfile.gender,
        dateOfBirth: savedProfile.dateOfBirth,
        bio: savedProfile.bio,
        profileImage: undefined,
        user: {
          id: USER_ID[1],
          username: 'alice',
        },
      });
    });

    it('should propagate NotFoundException when profile not found', async () => {
      profileService.updateProfile.mockRejectedValue(
        new NotFoundException(
          `The profile with id ${INVALID_ID} was not found`,
        ),
      );

      await expect(
        profileController.updateProfileUser(createProfileDto, INVALID_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
