import { Gender } from 'src/profile/profile.entity';
import { Paginated } from 'src/common/pagination/pagination.interface';

export const USER_ID = [1, 2];
export const PROFILE_ID = [1, 2];
export const INVALID_ID = 99;
export const INVALID_USERNAME = 'taken';
export const INVALID_EMAIL = 'taken@example.com';

export const rawUser = {
  id: USER_ID[0],
  username: 'Mark',
  email: 'mark@gmail.com',
  password: 'senhaHash',
  createdAt: new Date('2025-07-23T20:11:37.346Z'),
  updatedAt: new Date('2025-07-23T20:11:37.346Z'),
  deletedAt: null,
  profile: {
    id: PROFILE_ID[0],
    firstName: 'mark',
    lastName: 'will',
    gender: Gender.MALE,
    dateOfBirth: null,
    bio: null,
    profileImage: null,
    user: undefined,
  },
  tweets: undefined,
};

export const fakePaginated: Paginated<typeof rawUser> = {
  data: [rawUser],
  meta: {
    itemsPerPage: 1,
    totalItems: 9,
    currentPage: 1,
    totalPages: 9,
  },
  links: {
    first: 'http://localhost:3000/users?limit=1&page=1',
    last: 'http://localhost:3000/users?limit=1&page=9',
    current: 'http://localhost:3000/users?limit=1&page=1',
    next: 'http://localhost:3000/users?limit=1&page=2',
    previous: 'http://localhost:3000/users?limit=1&page=1',
  },
};

export const createUserDto = {
  username: 'alice',
  email: 'alice@example.com',
  password: 'Teste1234!',
  profile: {
    firstName: 'Alice',
    lastName: 'Wonder',
  },
};

export const createUserNoProfile = { ...createUserDto, profile: undefined };

export const savedUser = {
  id: USER_ID[1],
  username: 'alice',
  email: 'alice@example.com',
  password: 'senhaHash',
  createdAt: new Date('2025-08-08T16:00:30.480Z'),
  updatedAt: new Date('2025-08-08T16:00:30.480Z'),
  deletedAt: null,
  profile: undefined,
  tweets: undefined,
};

export const savedWithProfile = {
  ...savedUser,
  profile: {
    id: PROFILE_ID[1],
    firstName: 'Alice',
    lastName: 'Wonder',
    gender: null,
    dateOfBirth: null,
    bio: null,
    profileImage: null,
    user: undefined,
  },
};
