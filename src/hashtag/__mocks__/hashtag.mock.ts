// test/mocks/hashtag.mock.ts
import { Paginated } from 'src/common/pagination/pagination.interface';
import { HashtagResponseDto } from 'src/hashtag/dto/hashtag-response.dto';

// ====================
// IDs base
// ====================
export const HASHTAG_ID = [101, 102];
export const INVALID_HASHTAG_ID = 999;

// ====================
// Usuário completo (entidade Service)
// ====================
export const userEntity = {
  id: 1,
  username: 'Test1',
  email: 'teste1@gmail.com',
  password: '$2b$10$8aGwO6nvUihrB59WAkL0auXg5Pi.w',
  createdAt: new Date('2025-08-12T18:31:00.556Z'),
  updatedAt: new Date('2025-08-12T18:31:00.556Z'),
  deletedAt: null,
  profile: undefined,
  tweets: undefined,
};

// ====================
// Tweets no formato ENTIDADE (Service)
// ====================
export const tweetEntity1 = {
  id: 3,
  text: 'tweet text',
  image: 'url image',
  createdAt: new Date('2025-08-13T18:07:29.935Z'),
  updatedAt: new Date('2025-08-13T18:07:29.935Z'),
  user: userEntity,
};

export const tweetEntity2 = {
  id: 4,
  text: 'outro tweet',
  image: undefined,
  createdAt: new Date('2025-08-14T18:07:29.935Z'),
  updatedAt: new Date('2025-08-14T18:07:29.935Z'),
  user: userEntity,
};

// ====================
// Tweets no formato DTO (Controller)
// ====================
export const tweetListItem1 = {
  id: 3,
  text: 'tweet text',
  image: 'url image',
  createdAt: new Date('2025-08-13T18:07:29.935Z'),
  updatedAt: new Date('2025-08-13T18:07:29.935Z'),
};

export const tweetListItem2 = {
  id: 4,
  text: 'outro tweet',
  image: undefined,
  createdAt: new Date('2025-08-14T18:07:29.935Z'),
  updatedAt: new Date('2025-08-14T18:07:29.935Z'),
};

// ====================
// ---- FORMATO CRU DE ENTIDADE (Service) ----
export const rawHashtagEntity = {
  id: HASHTAG_ID[0],
  name: 'typescript',
  deletedAt: null,
  tweets: [tweetEntity1, tweetEntity2],
};

export const rawHashtagEntityNoTweets = {
  ...rawHashtagEntity,
  tweets: [],
};

export const savedHashtagEntity = {
  id: HASHTAG_ID[1],
  name: 'nestjs',
  deletedAt: null,
  tweets: undefined,
};

// ====================
// ---- FORMATO DTO (Controller) ----
export const rawHashtagDto: HashtagResponseDto = {
  id: HASHTAG_ID[0],
  name: 'typescript',
  tweets: [tweetListItem1, tweetListItem2],
};

export const rawHashtagDtoNoTweets: HashtagResponseDto = {
  id: HASHTAG_ID[0],
  name: 'typescript',
  tweets: [],
};

export const savedHashtagDto: HashtagResponseDto = {
  id: HASHTAG_ID[1],
  name: 'nestjs',
  tweets: undefined,
};

// ====================
// ---- DTO de entrada (argumentos para Service) ----
export const createHashtagDto = {
  name: 'typescript',
};

// ====================
// ---- Paginação fake ----
export const fakePaginatedHashtagsEntity: Paginated<typeof rawHashtagEntity> = {
  data: [rawHashtagEntity],
  meta: {
    itemsPerPage: 1,
    totalItems: 2,
    currentPage: 1,
    totalPages: 2,
  },
};

export const fakePaginatedHashtagsDto: Paginated<typeof rawHashtagDto> = {
  data: [rawHashtagDto],
  meta: {
    itemsPerPage: 1,
    totalItems: 2,
    currentPage: 1,
    totalPages: 2,
  },
};
