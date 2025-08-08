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
  USER_ID,
  PROFILE_ID,
  INVALID_ID,
  INVALID_USERNAME,
  rawUser,
  fakePaginated,
  createUserDto,
  savedUser,
  savedWithProfile,
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

      const result = await userService.createUser(dto);

      expect(userRepo.findOne).toHaveBeenNthCalledWith(1, {
        where: { username: dto.username },
      });
      expect(userRepo.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: dto.email },
      });

      expect(hashingProvider.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(userRepo.create).toHaveBeenCalledWith({
        ...dto,
        password: 'senhaCriptografada',
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

    it('should throw UserAlreadyExistsException with username arealdy exists', async () => {
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

    it('should throw UserAlreadyExistsException with email arealdy exists', async () => {
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

    it('deve criar profile mesmo sem profile no DTO (profile vazio + user)', async () => {
      const dto: CreateUserDto = {
        username: 'bob',
        email: 'bob@example.com',
        password: 'S3nh@!',
      };

      userRepo.findOne.mockResolvedValueOnce(undefined);
      userRepo.findOne.mockResolvedValueOnce(undefined);
      hashingProvider.hashPassword.mockResolvedValue('hashBob');
      userRepo.create.mockImplementation((e) => e);
      userRepo.save.mockResolvedValue({
        ...savedUser,
        id: USER_ID[1],
        username: 'bob',
        email: 'bob@example.com',
        password: 'hashBob',
      } as any);
      profileService.createProfile.mockResolvedValue(undefined);

      const result = await userService.createUser(dto);

      expect(profileService.createProfile).toHaveBeenCalledWith({
        user: expect.objectContaining({ id: USER_ID[1] }),
      });
      expect(result.username).toBe('bob');
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário com profile (deleta profile antes)', async () => {
      // findOne com relations ['profile']
      userRepo.findOne.mockResolvedValue({
        ...savedWithProfile,
        profile: { id: PROFILE_ID[1] },
      } as any);

      profileService.deleteProfile.mockResolvedValue(undefined);
      userRepo.delete.mockResolvedValue(undefined);

      const result = await userService.deleteUser(USER_ID[1]);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: USER_ID[1] },
        relations: ['profile'],
      });
      expect(profileService.deleteProfile).toHaveBeenCalledWith(PROFILE_ID[1]);
      expect(userRepo.delete).toHaveBeenCalledWith(USER_ID[1]);
      expect(result).toEqual({ delete: true });
    });

    it('deve deletar usuário sem profile (não chama deleteProfile)', async () => {
      userRepo.findOne.mockResolvedValue({
        ...savedUser,
        profile: undefined,
      } as any);

      userRepo.delete.mockResolvedValue(undefined);

      const result = await userService.deleteUser(USER_ID[1]);

      expect(profileService.deleteProfile).not.toHaveBeenCalled();
      expect(userRepo.delete).toHaveBeenCalledWith(USER_ID[1]);
      expect(result).toEqual({ delete: true });
    });

    it('deve lançar NotFoundException quando id não existe', async () => {
      userRepo.findOne.mockResolvedValue(undefined);

      await expect(userService.deleteUser(INVALID_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('deve retornar o usuário quando existe', async () => {
      userRepo.findOneBy.mockResolvedValue(savedUser as any);

      const result = await userService.findUserById(USER_ID[1]);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: USER_ID[1] });
      expect(result).toEqual(savedUser);
    });

    it('deve lançar NotFoundException quando não existe', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);

      await expect(userService.findUserById(INVALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByUsername', () => {
    it('deve retornar o usuário quando username existe', async () => {
      userRepo.findOneBy.mockResolvedValue(rawUser as any);

      const result = await userService.findUserByUsername('Mark');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ username: 'Mark' });
      expect(result).toEqual(rawUser);
    });

    it('deve lançar NotFoundException quando username não existe', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);

      await expect(
        userService.findUserByUsername(INVALID_USERNAME),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserByIdWithProfile', () => {
    it('deve retornar usuário com profile quando existe', async () => {
      userRepo.findOne.mockResolvedValue(savedWithProfile as any);

      const result = await userService.findUserByIdWithProfile(USER_ID[1]);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: USER_ID[1] },
        relations: ['profile'],
      });
      expect(result).toEqual(savedWithProfile);
    });

    it('deve lançar NotFoundException quando não existe', async () => {
      userRepo.findOne.mockResolvedValue(undefined);

      await expect(
        userService.findUserByIdWithProfile(INVALID_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
