import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './user.entity';
import { ProfileService } from 'src/profile/profile.service';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { HashingProvider } from 'src/auth/provider/hashing.provider';
import { UserAlreadyExistsException } from 'src/customExceptions/user-arealdy-exists.exception';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { CreateUserDto } from './dtos/create-user.dto';

import {
  PROFILE_ID,
  INVALID_ID,
  INVALID_USERNAME,
  rawUser,
  fakePaginated,
  createUserDto,
  savedUser,
  savedWithProfile,
  createUserNoProfile,
} from './__mocks__/user.mock';

describe('UserService (unit)', () => {
  let userService: UserService;

  // Mocks
  let userRepo: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  let profileService: {
    createProfile: jest.Mock;
    deleteProfile: jest.Mock;
  };

  let paginationProvider: {
    paginateQuery: jest.Mock;
  };

  let hashingProvider: {
    hashPassword: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    profileService = {
      createProfile: jest.fn(),
      deleteProfile: jest.fn(),
    };

    paginationProvider = {
      paginateQuery: jest.fn(),
    };

    hashingProvider = {
      hashPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: ProfileService, useValue: profileService },
        { provide: PaginationProvider, useValue: paginationProvider },
        { provide: HashingProvider, useValue: hashingProvider },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should paginated users by PaginationProvider', async () => {
      const query: PaginationQueryDto = { limit: 1, page: 1 };
      paginationProvider.paginateQuery.mockResolvedValue(fakePaginated);

      const result = await userService.getAllUsers(query);

      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        query,
        userRepo,
        undefined,
        ['profile'],
      );
      expect(result).toEqual(fakePaginated);
    });
  });

  describe('createUser', () => {
    it('should create user, hash password and create profile', async () => {
      const dto: CreateUserDto = createUserDto as CreateUserDto;

      // Retornando undefine para afirmar que não existe username/email já existentes
      userRepo.findOne
        .mockResolvedValueOnce(undefined) // usernameExist
        .mockResolvedValueOnce(undefined); // emailExist

      // hash retorna senha "senhaHash"
      hashingProvider.hashPassword.mockResolvedValue('senhaHash');

      // create -> Qualquer que seja o argumento recebido, devolva-o exatamente como veio
      userRepo.create.mockImplementation((e: CreateUserDto) => e);

      // save -> retorna o usuário salvo (mock)
      userRepo.save.mockResolvedValue(savedUser);

      // createProfile -> ok
      profileService.createProfile.mockResolvedValue(undefined);

      const { profile: _, ...userData } = dto;
      const result = await userService.createUser(dto);

      expect(userRepo.findOne).toHaveBeenNthCalledWith(1, {
        where: { username: dto.username },
      });
      expect(userRepo.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: dto.email },
      });

      expect(hashingProvider.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(userRepo.create).toHaveBeenCalledWith({
        ...userData,
        password: 'senhaHash',
      });
      expect(userRepo.save).toHaveBeenCalled();

      expect(profileService.createProfile).toHaveBeenCalledWith({
        firstName: dto.profile?.firstName,
        lastName: dto.profile?.lastName,
        gender: undefined,
        dateOfBirth: undefined,
        bio: undefined,
        profileImage: undefined,
        user: savedUser,
      });

      expect(result).toEqual(savedUser);
    });

    it('should throw UserAlreadyExistsException when username arealdy exists', async () => {
      const dto: CreateUserDto = createUserDto as CreateUserDto;

      userRepo.findOne.mockResolvedValueOnce({
        ...rawUser,
        username: dto.username,
      }); // usernameExist

      await expect(userService.createUser(dto)).rejects.toThrow(
        UserAlreadyExistsException,
      );

      expect(hashingProvider.hashPassword).not.toHaveBeenCalled();
      expect(userRepo.create).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(profileService.createProfile).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistsException when email arealdy exists', async () => {
      const dto: CreateUserDto = createUserDto as CreateUserDto;

      userRepo.findOne
        .mockResolvedValueOnce(undefined) // usernameExist
        .mockResolvedValueOnce({ ...rawUser, email: dto.email }); // emailExist

      await expect(userService.createUser(dto)).rejects.toThrow(
        UserAlreadyExistsException,
      );

      expect(hashingProvider.hashPassword).not.toHaveBeenCalled();
      expect(userRepo.create).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(profileService.createProfile).not.toHaveBeenCalled();
    });

    it('should create a profile even without a profile in the DTO (empty profile + user)', async () => {
      const dto: CreateUserDto = createUserNoProfile;

      userRepo.findOne.mockResolvedValueOnce(undefined);
      userRepo.findOne.mockResolvedValueOnce(undefined);
      hashingProvider.hashPassword.mockResolvedValue('senhaHash');
      userRepo.create.mockImplementation((e: CreateUserDto) => e);
      userRepo.save.mockResolvedValue({
        ...savedUser,
      });
      profileService.createProfile.mockResolvedValue({
        id: PROFILE_ID[1],
        firstName: null,
        lastName: null,
        gender: null,
        dateOfBirth: null,
        bio: null,
        profileImage: null,
        user: savedUser,
      });

      const result = await userService.createUser(dto);

      expect(profileService.createProfile).toHaveBeenCalledWith({
        user: savedUser,
      });
      expect(result.username).toBe('alice');
    });
  });

  describe('deleteUser', () => {
    it('should delete user with profile (delete profile before)', async () => {
      // findOne com relations ['profile']
      userRepo.findOne.mockResolvedValue({
        ...savedWithProfile,
      });

      profileService.deleteProfile.mockResolvedValue({
        raw: [],
        affected: 1,
      });
      userRepo.delete.mockResolvedValue({
        raw: [],
        affected: 1,
      });
      const result = await userService.deleteUser(savedWithProfile.id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: savedWithProfile.id },
        relations: ['profile'],
      });
      expect(profileService.deleteProfile).toHaveBeenCalledWith(
        savedWithProfile.profile.id,
      );
      expect(userRepo.delete).toHaveBeenCalledWith(savedWithProfile.id);
      expect(result).toEqual({ delete: true });
    });

    it('should throw NotFoundException when id does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(userService.deleteUser(INVALID_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return user when exists', async () => {
      userRepo.findOneBy.mockResolvedValue(savedUser);

      const result = await userService.findUserById(savedUser.id);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: savedUser.id });
      expect(result).toEqual(savedUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(userService.findUserById(INVALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByUsername', () => {
    it('should return user when username exists', async () => {
      userRepo.findOneBy.mockResolvedValue(savedUser);

      const result = await userService.findUserByUsername(savedUser.username);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        username: savedUser.username,
      });
      expect(result).toEqual(savedUser);
    });

    it('should throw NotFoundException when username does not exist', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(
        userService.findUserByUsername(INVALID_USERNAME),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserByIdWithProfile', () => {
    it('should return user with profile when exists', async () => {
      userRepo.findOne.mockResolvedValue(savedWithProfile);

      const result = await userService.findUserByIdWithProfile(
        savedWithProfile.id,
      );

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: savedWithProfile.id },
        relations: ['profile'],
      });
      expect(result).toEqual(savedWithProfile);
    });

    it('should throw NotFoundException when does not exists', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        userService.findUserByIdWithProfile(INVALID_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
