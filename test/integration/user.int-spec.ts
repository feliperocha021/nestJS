import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../../src/user/user.entity';
import { Profile } from '../../src/profile/profile.entity';
import { UserService } from '../../src/user/user.service';
import { ProfileModule } from '../../src/profile/profile.module';
import { PaginationModule } from '../../src/common/pagination/pagination.module';

import { HashingProvider } from '../../src/auth/provider/hashing.provider';
import { BcryptProvider } from '../../src/auth/provider/bcrypt.provider';

import { CreateUserDto } from '../../src/user/dtos/create-user.dto';
import { UserAlreadyExistsException } from 'src/customExceptions/user-arealdy-exists.exception';
import { PostgresTestModule } from './postgres-test.module';
import { Tweet } from 'src/tweet/tweet.entity';

describe('UserModule – Integration', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let userService: UserService;
  let dataSource: DataSource;

  const validUser: CreateUserDto = {
    username: 'felipe',
    email: 'felipe@example.com',
    password: 'Senha123!',
    profile: { bio: 'Minha bio' },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PostgresTestModule,
        TypeOrmModule.forFeature([User, Profile, Tweet]),
        ProfileModule,
        PaginationModule,
      ],
      providers: [
        UserService,
        {
          provide: HashingProvider,
          useClass: BcryptProvider,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    userService = moduleRef.get<UserService>(UserService);
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // recria as tabelas a partir das suas entities
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('createUser', () => {
    it('should create a new user with success', async () => {
      const created = await userService.createUser(validUser);

      expect(created).toMatchObject({
        username: validUser.username,
        email: validUser.email,
      });
      expect(created).toHaveProperty('profile');
      expect(created).toHaveProperty('password');
      expect(created).toHaveProperty('tweets');
    });

    it('should throw error when to create duplicate user (username)', async () => {
      await userService.createUser(validUser);

      await expect(
        userService.createUser({
          ...validUser,
          email: 'outro@example.com',
        }),
      ).rejects.toThrow(UserAlreadyExistsException);
    });

    it('should throw error when to create duplicate user (email)', async () => {
      await userService.createUser(validUser);

      await expect(
        userService.createUser({
          ...validUser,
          username: 'pedro',
        }),
      ).rejects.toThrow(UserAlreadyExistsException);
    });
  });

  describe('getAllUsers', () => {
    it('should list users with pagination', async () => {
      await userService.createUser(validUser);

      const result = await userService.getAllUsers({ limit: 10, page: 1 });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta.currentPage).toBe(1);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and linked profile', async () => {
      const created = await userService.createUser(validUser);

      const deleted = await userService.deleteUser(created.id);
      expect(deleted).toEqual({ delete: true });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(userService.deleteUser(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user details when ID exists', async () => {
      const created = await userService.createUser(validUser);

      const found = await userService.findUserById(created.id);
      expect(found).toMatchObject({
        id: created.id,
        username: validUser.username,
      });
      expect(created).toHaveProperty('profile');
      expect(created).toHaveProperty('password');
      expect(created).toHaveProperty('tweets');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(userService.findUserById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
