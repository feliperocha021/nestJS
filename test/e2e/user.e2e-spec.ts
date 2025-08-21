import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

import { User } from '../src/user/user.entity';
import { Profile } from '../src/profile/profile.entity';

describe('User Module (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;
  let userRepo: Repository<User>;
  let profileRepo: Repository<Profile>;
  let testUserId: number;

  // Stub guard: allows every request and injects req.user.sub = testUserId
  const mockAuthGuard = {
    canActivate: (context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { sub: testUserId };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    // enable validation + auto-transform
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    httpServer = app.getHttpServer();
    userRepo = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    profileRepo = moduleFixture.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
  });

  beforeEach(async () => {
    // clear test data to isolate each spec
    await profileRepo.clear();
    await userRepo.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users → should create a new user with empty profile', async () => {
    const payload = {
      email: 'test@example.com',
      username: 'tester',
      password: 'Aa1!aaaa',
    };

    const res = await request(httpServer)
      .post('/users')
      .send(payload)
      .expect(201);

    const body = res.body as any;
    expect(body.id).toBeDefined();
    expect(body.email).toEqual(payload.email);
    expect(body.username).toEqual(payload.username);
    expect(body.createdAt).toBeDefined();
    expect(body.profile).toBeDefined();
    expect(body.profile.id).toBeDefined();

    testUserId = body.id;
  });

  it('GET /users → should return paginated list including our user', async () => {
    // first, create one user
    const u = userRepo.create({
      email: 'a@b.com',
      username: 'foo',
      password: 'hashed',
    });
    const saved = await userRepo.save(u);
    // create profile manually (service would do this in real app)
    await profileRepo.save({ user: saved });

    // now request list
    const res = await request(httpServer)
      .get('/users?limit=5&page=1')
      .expect(200);

    const { data, meta, links } = res.body as any;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toEqual(saved.id);
    expect(meta).toMatchObject({
      totalItems: 1,
      itemsPerPage: 5,
      currentPage: 1,
      totalPages: 1,
    });
    expect(links.first).toContain('page=1');
    expect(links.last).toContain('page=1');
    expect(links.current).toContain('page=1');
  });

  it('GET /users/me → should return details of the authenticated user', async () => {
    // prepare a user and profile
    const u = userRepo.create({
      email: 'me@me.com',
      username: 'meuser',
      password: 'hashed',
    });
    const saved = await userRepo.save(u);
    await profileRepo.save({ user: saved });

    testUserId = saved.id;

    const res = await request(httpServer)
      .get('/users/me')
      .expect(200);

    const body = res.body as any;
    expect(body.id).toEqual(saved.id);
    expect(body.username).toEqual('meuser');
    expect(body.email).toEqual('me@me.com');
    expect(body.profile).toBeDefined();
    expect(body.profile.user.id).toEqual(saved.id);
  });

  it('DELETE /users/me → should delete user and its profile', async () => {
    // create user+profile
    const u = userRepo.create({
      email: 'del@me.com',
      username: 'deleter',
      password: 'hashed',
    });
    const saved = await userRepo.save(u);
    await profileRepo.save({ user: saved });

    testUserId = saved.id;

    // call delete
    const res = await request(httpServer)
      .delete('/users/me')
      .expect(200);
    expect(res.body).toEqual({ delete: true });

    // now trying to fetch gives 404
    await request(httpServer)
      .get('/users/me')
      .expect(404);
  });
});
