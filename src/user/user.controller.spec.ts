// src/user/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDetailDto } from './dtos/user-detail.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserAlreadyExistsException } from 'src/customExceptions/user-arealdy-exists.exception';
import {
  USER_ID,
  PROFILE_ID,
  INVALID_ID,
  INVALID_USERNAME,
  INVALID_EMAIL,
  rawUser,
  fakePaginated,
  createUserDto,
  savedUser,
  savedWithProfile,
} from './__mocks__/user.mock';

describe('UserController (unit)', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getAllUsers: jest.fn(),
            findUserById: jest.fn(),
            createUser: jest.fn(),
            findUserByIdWithProfile: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<jest.Mocked<UserService>>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should fetch paginated users and return DTOs', async () => {
      userService.getAllUsers.mockResolvedValue(fakePaginated);

      const query = { limit: 1, page: 1 };
      const result = await userController.getAllUsers(query);

      expect(userService.getAllUsers).toHaveBeenCalledWith(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(UserDetailDto);
      expect(result.data[0]).toEqual({
        id: USER_ID[0],
        username: 'Mark',
        email: 'mark@gmail.com',
        createdAt: rawUser.createdAt,
        profile: {
          id: PROFILE_ID[0],
          firstName: 'mark',
          lastName: 'will',
          gender: rawUser.profile.gender,
          dateOfBirth: null,
          bio: null,
          profileImage: null,
        },
      });
      expect(result.meta).toEqual(fakePaginated.meta);
      expect(result.links).toEqual(fakePaginated.links);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user and return a DTO', async () => {
      const userWithoutProfile = { ...rawUser, profile: undefined };
      userService.findUserById.mockResolvedValue(userWithoutProfile);

      const result = await userController.getUserById(USER_ID[0]);

      expect(userService.findUserById).toHaveBeenCalledWith(USER_ID[0]);
      expect(result).toBeInstanceOf(UserDetailDto);
      expect(result).toEqual({
        id: userWithoutProfile.id,
        username: userWithoutProfile.username,
        email: userWithoutProfile.email,
        createdAt: userWithoutProfile.createdAt,
      });
    });

    it('should propagate NotFoundException when user not found', async () => {
      const missingId = INVALID_ID;

      userService.findUserById.mockRejectedValue(
        new NotFoundException(`The user with id ${missingId} was not found`),
      );

      await expect(userController.getUserById(missingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a user and return a DTO', async () => {
      const dto: CreateUserDto = createUserDto as CreateUserDto;

      userService.createUser.mockResolvedValue(savedUser);
      userService.findUserByIdWithProfile.mockResolvedValue(savedWithProfile);

      const result = await userController.createUser(dto);

      expect(userService.createUser).toHaveBeenCalledWith(dto);
      expect(userService.findUserByIdWithProfile).toHaveBeenCalledWith(
        savedUser.id,
      );
      expect(result).toBeInstanceOf(UserDetailDto);
      expect(result).toEqual({
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
        profile: {
          firstName: 'Alice',
          lastName: 'Wonder',
          gender: null,
          dateOfBirth: null,
          bio: null,
          profileImage: null,
        },
      });
    });

    it('should propagate UserAlreadyExistsException', async () => {
      const dto: CreateUserDto = {
        username: INVALID_USERNAME,
        email: INVALID_EMAIL,
        password: 'Teste1234!',
      };

      userService.createUser.mockRejectedValue(
        new UserAlreadyExistsException('username', INVALID_USERNAME),
      );

      await expect(userController.createUser(dto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should return true', async () => {
      const fakeResponse = { delete: true };

      userService.deleteUser.mockResolvedValue(fakeResponse);

      const result = await userController.deleteUser(USER_ID[0]);

      expect(userService.deleteUser).toHaveBeenCalledWith(USER_ID[0]);
      expect(result).toEqual(fakeResponse);
    });

    it('should propagate NotFoundException when user not found', async () => {
      const missingId = INVALID_ID;

      userService.deleteUser.mockRejectedValue(
        new NotFoundException(`user with id ${missingId} does not exist`),
      );

      await expect(userController.deleteUser(missingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
