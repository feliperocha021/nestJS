import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ProfileService } from '../../src/profile/profile.service';
import { PaginationModule } from '../../src/common/pagination/pagination.module';

import { UserService } from '../../src/user/user.service';
import { CreateUserDto } from '../../src/user/dtos/create-user.dto';
import { UserModule } from 'src/user/user.module';

import { APP_GUARD } from '@nestjs/core';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/strategies/jwt-refresh.strategy';
import { PostgresTestModule } from './postgres-test.module';
import { Redis } from 'ioredis';

import { User } from 'src/user/user.entity';
import { Profile } from 'src/profile/profile.entity';

// criando guard fake para evitar autenticação
class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('ProfileModule – Integration', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let profileService: ProfileService;
  let userService: UserService;
  let dataSource: DataSource;
  let redisClient: Redis;

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
        TypeOrmModule.forFeature([User, Profile]),
        UserModule,
        PaginationModule,
      ],
      providers: [
        ProfileService,
        {
          provide: APP_GUARD,
          useClass: TestAuthGuard,
        },
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue({})
      .overrideProvider(JwtRefreshStrategy)
      .useValue({})
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        quit: async () => {},
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    profileService = moduleRef.get(ProfileService);
    userService = moduleRef.get(UserService);
    dataSource = moduleRef.get(DataSource);
    redisClient = moduleRef.get<Redis>('REDIS_CLIENT');
  });

  beforeEach(async () => {
    // recria as tabelas a partir das suas entities
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    // fecha HTTP + DB
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    // fecha socket do Redis
    await redisClient.quit();

    // garante que o event loop esvazie
    await new Promise((res) => setImmediate(res));
  });

  describe('createProfile', () => {
    it('should create profile successfully', async () => {
      const created = await profileService.createProfile({
        firstName: 'Felipe',
        lastName: 'Silva',
        bio: 'Bio teste',
      });
      expect(created).toMatchObject({
        firstName: 'Felipe',
        lastName: 'Silva',
        bio: 'Bio teste',
      });
      expect(created).toHaveProperty('id');
    });
  });

  describe('getAllProfiles', () => {
    it('should list profiles with pagination', async () => {
      await profileService.createProfile({
        firstName: 'Felipe',
        lastName: 'Silva',
        bio: 'Bio teste',
      });

      const result = await profileService.getAllProfiles({
        limit: 10,
        page: 1,
      });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta.currentPage).toBe(1);
    });
  });

  describe('updateProfile', () => {
    it('should update profile when user exists', async () => {
      const createdUser = await userService.createUser(validUser);

      const updated = await profileService.updateProfile(createdUser.id, {
        bio: 'Nova bio',
        firstName: 'Filipe',
      });

      expect(updated.bio).toBe('Nova bio');
      expect(updated.firstName).toBe('Filipe');
      expect(updated.user?.id).toBe(createdUser.id);
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      await expect(
        profileService.updateProfile(999, { bio: 'Atualizada' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProfile', () => {
    it('should delete existing profile', async () => {
      const createdUser = await userService.createUser(validUser);

      const userWithProfile = await userService.findUserByIdWithProfile(
        createdUser.id,
      );

      const profileId = userWithProfile.profile?.id as number;
      const deleted = await profileService.deleteProfile(profileId);
      expect(deleted).toBeDefined();
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      await expect(profileService.deleteProfile(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
