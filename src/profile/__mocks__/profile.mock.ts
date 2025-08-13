import { Gender } from 'src/profile/profile.entity';
import { Paginated } from 'src/common/pagination/pagination.interface';

export const USER_ID = [1, 2];
export const PROFILE_ID = [1, 2];
export const INVALID_ID = 99;
export const INVALID_USERNAME = 'taken';
export const INVALID_EMAIL = 'taken@example.com';

export const rawProfile = {
  id: PROFILE_ID[0],
  firstName: 'Mark',
  lastName: 'Will',
  gender: Gender.MALE,
  dateOfBirth: new Date('1990-05-20T00:00:00.000Z'),
  bio: 'Just a test profile',
  profileImage: 'https://example.com/avatar.png',
  user: {
    id: USER_ID[0],
    username: 'Mark',
    email: 'mark@gmail.com',
    password: 'senhaHash',
    createdAt: new Date('2025-07-23T20:11:37.346Z'),
    updatedAt: new Date('2025-07-23T20:11:37.346Z'),
    deletedAt: null,
    profile: undefined,
    tweets: undefined,
  },
};

export const rawProfileNoUser = {
  ...rawProfile,
  user: undefined,
};

export const createProfileDto = {
  firstName: 'Alice',
  lastName: 'Wonder',
  gender: Gender.FEMALE,
  dateOfBirth: new Date('1995-01-15T00:00:00.000Z'),
  bio: 'Tester account',
};

export const savedProfile = {
  id: PROFILE_ID[1],
  ...createProfileDto,
  user: {
    id: USER_ID[1],
    username: 'alice',
    email: 'alice@example.com',
    password: 'senhaHash',
    createdAt: new Date('2025-08-08T16:00:30.480Z'),
    updatedAt: new Date('2025-08-08T16:00:30.480Z'),
    deletedAt: null,
    profile: undefined,
    tweets: undefined,
  },
};

export const fakePaginatedProfiles: Paginated<typeof rawProfile> = {
  data: [rawProfile],
  meta: {
    itemsPerPage: 1,
    totalItems: 3,
    currentPage: 1,
    totalPages: 3,
  },
};
